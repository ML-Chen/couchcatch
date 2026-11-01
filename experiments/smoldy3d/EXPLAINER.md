# How the 3D Smoldy works

`index.html` draws Smoldy, the little fire fox from Couchcatch, in real time in the browser. There is
no 3D model file, no mesh, no texture image and no library. The whole fox is described by maths in one
fragment shader: a small program the graphics card runs once for every pixel on screen, every frame.
This document walks through that program in plain English, in the order the file is laid out. Function
and constant names in `code` are the ones in the file, so you can read the two side by side.

## The big picture

For each pixel, the shader:

1. Shoots a **ray** from the camera through that pixel (`main`).
2. Walks along the ray until it touches the fox, or decides it missed and hits the ground plane or sky
   (`castRay`, `render`).
3. Works out which way the surface faces there (the **normal**) and how tucked-away it is (**ambient
   occlusion**), in one shared loop (`probeSurface`).
4. Decides what colour the fur is at that spot (`paintFur`) and how its clumps and strands lie
   (`furStructure`).
5. Lights it: sun, sky, bounce light, shadows, occlusion, hair highlight, rim glow (`shadeFur`,
   `shadeEye`, `shadeNose`).
6. Adds the glowing flame on top (`addFlame`).
7. Converts the result into displayable colour (`toneMap`, gamma, dither).

The JavaScript at the bottom of the file does the "puppeteering". Every frame `poseFox` works out where
the head is turned, how far the eyelids are closed, where the tail is swinging, and so on. It hands those
numbers to the shader as **uniforms** (values that are the same for every pixel). The shader only ever
draws "the fox in this pose". The JavaScript also keeps the page responsive: it decides how many pixels
to draw and how often (section 14).

## 1. What a signed distance function is

Instead of a list of triangles, each shape is described by a function: give it a point in space and it
answers **"how far is this point from my surface?"** The answer is positive outside the shape, negative
inside, and zero exactly on the surface. That is a *signed distance function*, or SDF.

A sphere is the simplest: `length(point - center) - radius`. Section 7 of the shader has the few shapes
Smoldy needs:

* `sdEllipsoid`: a squashed sphere (body, chest, skull, paws, eyes, nose). There is no simple exact
  formula, so this is a very good estimate.
* `sdRoundCone`: two spheres of different sizes joined by a smooth cone. Legs, snout, ears, cheek tufts
  and even the flame's teardrop are round cones.
* `sdQuadraticBezier`: the distance to a curved line, plus *how far along the curve* the closest point
  is (`t`, from 0 to 1). The bushy tail is "every point within `tailRadius(t)` of this curve", so it can
  be thin at the root, fat in the middle and pointed at the tip (`tailDistance`).

These formulas come from Inigo Quilez's articles (iquilezles.org). The variables are renamed so the
shader reads as English.

### Combining shapes

If you have the distance to shape A and to shape B, the distance to "A and B together" is just
`min(A, B)`: whichever surface is nearer. That gives a hard crease where they meet, like two balls of
clay pressed together.

**Smooth minimum** (`smoothMin`) rounds that crease off. When the two distances are within `blendWidth`
of each other it subtracts a little extra, so the surfaces swell into one another. Every fur part is
joined this way (`torsoDistance`, `legsDistance`, `headFurDistance`, `foxSDF`), so Smoldy reads as one
soft body with no seams. The blend width is chosen per joint: 0.10 between body and chest, so they melt
together, but only 0.006 for the eyelids.

**Smooth maximum** (`smoothMax`) does the opposite job. `max(A, B)` keeps only where *both* shapes are
(an intersection), and `max(A, -B)` carves B out of A. The ear (`earDistance`) uses both. Its outline is
a round cone, intersected with a slab (`abs(z) < halfThickness`) to make it thin. Then a smaller cone
(`earCupDistance`) is carved out of the front to make the inner-ear cup.

The eyes and nose are added with a plain `min`, not a smooth one. Their edges should be crisp, and they
carry their own **material number** (`MATERIAL_EYE`, `MATERIAL_NOSE`) so the renderer knows to shade
them differently. The eyes are small upright ovals (`EYE_RADII`), set a little apart and sunk into the
skull so only a shallow dome shows.

### Local spaces and mirroring

The head turns, so its parts are modelled in **head space**. `toHeadSpace` moves a world point so the
skull's centre is the origin, then rotates it by the inverse of the head's rotation. The skull, snout,
eyes and ears are then written as if the head never moved. Ears and eyes have their own spaces again
(`toEarSpace`, `toEyeSpace`), so "along the ear" is simply `+y`.

Smoldy is symmetric, so most parts are modelled only on the right side and mirrored with `abs(x)`. A
point on the left side is reflected onto the right before being measured. Four legs cost the same as two.

### Skipping work safely

The distance function is called dozens of times per pixel, so `foxSDF` skips parts that cannot matter.
The legs live below `LEGS_TOP`; the tail and head sit inside bounding spheres; `headFurDistance` skips
the ears unless the point is near `EAR_BOUND_CENTER`. A part is skipped only when even its bound is
further away than the body (plus the blend width), because then it cannot change the answer.

One tempting shortcut, "return the distance to the bounding sphere instead", is *wrong* here. That
distance is too small, and the shadow and occlusion code reads small distances as "fur right next to
me". An early version had dark rings on the ground and black streaks on the body for exactly that reason.

## 2. Ray marching (sphere tracing)

Now the clever part. If the distance function says the nearest surface is 0.3 away, then a sphere of
radius 0.3 around the current point is guaranteed empty, so we can safely jump 0.3 along the ray. Repeat:
measure, jump, measure, jump. Near a surface the jumps get tiny, and when the distance is smaller than a
third of a pixel at that distance, we call it a hit. That is `castRay`. Details worth noticing:

* It first intersects the ray with the fox's bounding sphere (`sphereIntersect`). Rays that miss it
  never march at all.
* Each step moves only 90% of the distance (`* 0.9`), because a few of the shapes are estimates rather
  than exact distances.
* "Close enough" is measured against the size of a pixel (`gPixelAngle`), so a low-resolution frame
  stops earlier and costs less.
* The loop stops at `uMarchSteps`, a budget set by JavaScript (see "Keeping the compiled shader small").

While marching, `castRay` also remembers where the ray passed **closest** to the fox: how far along the
ray, how wide the gap was (`nearMissGap`), and which material was nearest. That is what lets `render` draw
a soft, wispy outline (section 5).

## 3. Normals and ambient occlusion: `probeSurface`

Lighting needs two facts about a surface point. **Which way it faces** (the normal): the distance grows
fastest straight out of the surface, so the normal is the *gradient* of the SDF. **How tucked-away it is**
(ambient occlusion): sky light reaches open, convex surfaces easily and creases much less.

`probeSurface` gets both from one loop of distance samples:

* Samples 0–3 sit just around the point at the corners of a tetrahedron. Adding up the corner
  directions, each weighted by the distance found there, estimates the gradient: four samples instead
  of the obvious six. Their average is the distance at the centre, used to step the point exactly onto
  the surface.
* The next samples step out along that normal. If the scene there is closer than how far we stepped,
  something nearby (or the ground) is crowding the point and blocking the sky.

For the ground the normal is simply "up", so those four samples are skipped. Ground points far from the
fox need no occlusion at all, and the contact occlusion fades out before that zone ends, so no seam shows.

## 4. Painting: what colour is the fur here?

`paintFur` decides the fur colour at a surface point using **masks**: numbers from 0 to 1 made with
`smoothstep`, so colours fade into each other instead of having hard edges. Working in head or ear space
again makes this easy:

* An orange base coat, **redder** where the fur faces up (the back, the top of the head and tail) and
  **paler, sandier** on the flanks, like a real red fox (`FUR_BACK_SRGB`, `FUR_FLANK_SRGB`).
* Cream **bib** (a region of the chest), cream **muzzle** (everything on the face below a line that rises
  towards the cheeks), cream **tail tip** (the tail's `t` above about 0.75).
* Dark **socks**: simply everything lower than a certain height.
* **Ears**: cream-pink inside the cup, dark at the tip.
* **Blush**: a soft pink spot on each cheek. **Mouth**: a short stroke and a curved smile drawn as
  distance-to-a-curve on the snout. **Lash line**: a dark edge on the eyelid while blinking.

Colours are written as sRGB numbers (`FUR_ORANGE_SRGB` is the game's `#ff8a3d`) and converted with
`toLinear`. Light adds up physically only in *linear* units; screens expect *gamma-encoded* sRGB. Mixing
the two is the classic cause of muddy, too-dark CG.

`paintFur` returns a small `FurPaint` record: the colour plus masks the lighting needs. Is this an ear
(thin, so light shines through)? Is it inside an ear cup? And how **fluffy** is the fur here? Fluffiness
is high on the chest bib, cheeks, tail and ear edges, and low on the legs.

## 5. Fur that reads as fur

A smooth painted surface looks like a plush toy. Real fox fur has *structure*: hairs gather into clumps;
the gaps between clumps are dark because you see down to the shaded roots; the clump tips are lighter;
the whole pattern streams in the direction the fur grows; and the outline breaks into wisps. The shader
builds each of those:

* **Flow** (`furStructure`, steps 1–2): fur grows back along the body and head, down the legs and out
  along the tail. The noise is looked up in the fox's **resting pose** (the head's turn and the tail's
  swing are undone first). Otherwise the pattern would slide across Smoldy like a projected slide
  whenever it moved.
* **Clumps and strands** (step 3): three layers of value noise, each squashed along the flow so every
  clump is several times longer than it is wide. Broad patches give slow light/dark variation between
  areas of fur, clumps give the main structure, and fine strands appear only up close. Each layer fades
  out when it would be finer than a couple of pixels, because detail finer than a pixel only flickers.
  The face gets shorter, finer fur than the body. Together they form a little **height field**:
  0 down at the roots, 1 out at the tips.
* **Depth** (`shadeFur`): roots darker, tips lighter (`rootToTip`). The gaps between clumps also get
  extra occlusion. Where sunlight skims across the coat, the clumps shade the gaps behind them (fur
  **self-shadowing**).
* **Bumps** (step 4): `valueNoiseWithSlope` returns the noise's slope along with its value, almost for
  free. The normal is tilted down those slopes, so light picks out the ridges of each clump.
* **Hair highlight** (Kajiya-Kay): a hair is a thin cylinder, so it reflects light in a band *across* its
  length rather than in a round spot. The highlight is brightest where the strand direction is at right
  angles to the half-way vector (between the sun and the eye). Nudging the strand direction by the clump
  height breaks that band into streaks. It is kept weak and warm-tinted, so the fur sheens, not shines.
* **Wispy outline** (`render`): if a ray *just misses* the fox, it may still pass through stray hairs.
  `shadeFur` returns how far wisps stick out at that spot (fluffiness times the clump pattern, up to
  `TUFT_LENGTH`). The pixel's coverage compares the gap with that wisp length and the pixel's width, and
  wisps are partly see-through. The outline breaks into tufts, most visibly on the bib, cheeks, tail and
  ear edges.

## 6. Lighting the fur

Besides the fur structure above, `shadeFur` adds up several light sources. Each term is one line, and
each one fixes a specific "this looks fake" problem:

* **Sun with wrap lighting.** Ordinary diffuse light is `max(dot(normal, sunDirection), 0)`. It drops to
  black exactly at 90°, which looks like hard plastic. Wrap lighting lets it continue a bit past the
  terminator (`(dot + 0.35) / 1.35`), the way light scatters through fur.
* **Soft shadow** from the sun (below), with a **coloured penumbra**: `pow(shadow, (1.0, 1.25, 1.6))`
  makes green and blue fade faster than red, so shadow edges glow warm.
* **Sky dome:** cool blue light from above, dimmed by ambient occlusion. **Ground bounce:** warm light
  from below.
* **Light scattered in the fur:** a term tinted by the fur colour itself. Without it, shadowed orange fur
  lit only by the blue sky turns grey-brown. With it, shadows stay a rich orange.
* **Ear translucency:** when the sun is behind an ear, the ear glows warm, like fingers held over a torch.
* **Fuzz / rim:** at grazing angles many hair tips catch the light, so silhouettes get a soft glow.

## 7. Soft shadows

`softShadow` marches from the surface towards the sun using the same distance function. At each step it
compares the distance to the nearest surface with the distance travelled. If the ray slips past an ear
with only a tiny gap, that ratio is small, so the point is in partial shadow. The smallest ratio along
the ray becomes the shadow amount. Shadows come out soft, and softer the further the blocker is from
the surface they fall on, just like a real penumbra. `SHADOW_SOFTNESS` sets how wide the penumbra is.

Most shadow rays from the ground pass the fox with room to spare. `softShadow` works out how close the
ray comes to the fox's bounding sphere; if even that gap could not produce any penumbra, it returns
"fully lit" without marching. The search region is a padded sphere: without the padding, the penumbra of
rays that only just miss the fox would stop abruptly and draw an arc on the ground. Surfaces facing well
away from the sun skip the shadow march entirely (`render`).

There is a refined "improved" version of this technique, but it assumes every step is exactly the
distance returned. Combined with a minimum step size, it produced a jagged false shadow on Smoldy's
forehead, so this file uses the classic version.

## 8. Eyes, nose and blinking

`shadeEye` makes the eyes glassy. They are mostly **reflection**: the sky colour reflected in the eye,
stronger at grazing angles (the Fresnel effect), and a tight sun highlight. Then come two **catchlights**,
the bright spots that make cartoon eyes look alive (the 2D art has one big glint and a tiny sparkle).
They are imaginary lights fixed relative to the camera: up-left and down-right. If the reflected
direction points at one of them, the pixel gets a crisp white spot. The eye's shape is the same at any
size, so the spots cover the same share of it and scale with the eye. The bottom of each eye warms to
brown, like light glowing up through an iris.

**Blinking** uses real eyelids (`eyelidsDistance`). A furry shell slightly larger than the eye is cut by
a level that slides down from above (upper lid) and up from below (lower lid) as `uBlink` goes from 0 to
1. Both levels droop at the corners (`lidDroop`) by the same fraction of the eye's height at any eye size,
so the closed eye forms a soft, content arch with a painted lash line.

## 9. The flame

The flame is not a solid surface. It is a glowing **volume**. `flameField` gives, for any point, how much
fire is there (density) and how hot it is (heat). Its shape is a teardrop (a round cone) whose edge is
broken up by two octaves of noise scrolling upwards over time. The flame licks and flickers, calm at the
base and wild at the tip.

`addFlame` marches through the flame in `uFlameSteps` equal slices. The march is clipped to where the
fire can be: inside both a bounding sphere and a slim upright cylinder (`verticalCylinderIntersect`). It
also stops at any solid surface in front, so the tail tip correctly hides the bottom of the flame. This
is the standard **emission-absorption** model: each slice glows with `flameColor(heat)` and hides a
little of what is behind it. Thin noisy edges are see-through; the thick middle is nearly solid.
`flameColor` goes from deep red-orange at the edges, through orange and yellow, to near-white at the
core: the same three layers as the 2D flame. Each pixel starts its march at a random fraction of a
slice, which turns banding into a faint, fine grain.

Two extras sell it. A soft **halo** around the flame stands in for light scattering in the air, and
`flameLight` throws warm light onto the nearby fur and grass.

## 10. Sky, ground and haze

`skyColor` is a gradient from a pale, warm horizon to blue overhead, brighter towards the sun. The ground
is the plane `y = 0`, hit with a single division instead of marching. `meadowColor` blends two greens
with large-scale noise, plus a softer, sunnier patch under Smoldy like a little stage. Far-away ground
fades into the horizon colour (**depth haze**), so there is no hard horizon line.

## 11. Putting a pixel together: `render`

A pixel can show two surfaces: the ground (or sky) behind, and the fox in front, either filling the pixel
or only partly covering it at its wispy edge. `render` shades them in a little two-pass loop (layer 0 =
background, layer 1 = fox), then mixes the fox over the background by its coverage, then adds the flame.
Edge pixels get a cheaper treatment (no occlusion samples, a shorter shadow march): wisps are thin and
see-through, so it doesn't show.

## 12. From light to pixels: tone mapping and gamma

Lighting produces values above 1.0: sunlit cream fur, the flame core. A screen cannot show them, so
`toneMap` squeezes them into range with a smooth curve. This file uses the Khronos "PBR Neutral" curve
rather than the popular ACES curve. ACES shifts saturated colours, and Smoldy's orange came out
yellow-peach. PBR Neutral scales all three channels by the same factor, which keeps the hue, and only
fades the very brightest light (the flame core) towards white. `EXPOSURE` plays the role of a camera's
exposure setting; it was tuned until the rendered fur came out close to the game's `#ff8a3d`.

Then `main` applies **gamma** (`pow(color, 1/2.2)`, back to the sRGB the screen expects), a gentle
**vignette**, and **dithering**: less than one 8-bit step of random noise, which hides banding in the
smooth sky gradient.

## 13. Animation (JavaScript, section B)

`poseFox(time)` computes the pose each frame. Most motions are sums of slow sine waves at unrelated
speeds, so the idle loop never visibly repeats:

* **Breathing** (`breath`) gently inflates body and chest and bobs the head.
* **Head**: slow yaw, pitch and roll (a curious look-around and a tilt). These are combined into a rotation
  matrix; the shader gets its transpose, which for a rotation is the inverse, to carry points *into* head
  space.
* **Ears**: `earTwitch` is a damped spring, a quick flick that settles. Each ear has its own rhythm.
  `earFrame` combines the ear's rest orientation (`EAR_REST_FRAME`, built with a little Gram-Schmidt) with
  the twitch.
* **Blink**: `blinkAmount` closes the eyes every 4.1 s (quick close, slower open), with a double blink
  every third time.
* **Tail**: the curve's middle and tip swing side to side, the tip lagging behind. The flame **leans**
  against the tip's motion (`flameLean`) and **flickers** in brightness (`flameGlow`).

The camera (section D) orbits a target point: drag to turn, pinch or scroll to zoom. The *target*
values follow the finger, and the *current* values glide towards them each frame (`1 - exp(-dt * 7)`).
That is exponential smoothing, which gives the same damped glide at any frame rate. Until the first
touch, the camera slowly spins on its own.

## 14. Never freezing the page

The first published version could freeze the whole browser tab, especially inside claude.ai, where the
page runs in an iframe. There were two causes, and both are fixed.

### Keeping the compiled shader small

Graphics drivers turn every function call into a full pasted copy of that function ("inlining"), and
may paste a loop's body once per iteration ("unrolling"). The first version called the big fox distance
function from about eighteen places: separate normal, occlusion and shadow code for the fur, eyes, nose
and ground, all twice over (once for a hit, once for an edge pixel). The compiled program was enormous.
On the software renderer used for testing, the first draw (when the driver finishes compiling) took
27–32 seconds, and the tab could not paint meanwhile. Now:

* The distance function is called from exactly **three** places: `castRay`, `probeSurface` (normal and
  occlusion together) and `softShadow`.
* `render` shades the background and the fox in **one two-pass loop**, so the lighting code exists once.
* Every loop's length is a **budget passed in from JavaScript** (`uMarchSteps`, `uShadowSteps`,
  `uOcclusionSamples`, `uFlameSteps`), checked with `if (i >= budget) break`. Because the count is only
  known when the shader runs, drivers keep these as compact loops instead of unrolling them. The noise
  octaves (fur layers, meadow, flame) are loops too.

### Compiling without blocking, and a poster meanwhile

The page shows a small poster image (a 13 KB still of the opening view) and the caption straight away.
Only after that has painted does it start compiling (`startCompiling`). Where the browser offers
`KHR_parallel_shader_compile`, the compile runs in the background, and `waitForProgram` checks once per
animation frame whether it has finished, instead of blocking. When it is ready, the 3D view fades in
over the poster.

### Measuring the device, and staying under budget

The rule: no single frame should keep the GPU busy for more than about 30 ms, because a long GPU frame
stalls everything on screen, including the page around an iframe.

* **Calibration** (`calibrate`): a 1-pixel warm-up frame, then a ~12,000-pixel frame timed with
  `gl.finish()` (which waits until the GPU is done). That gives the device's real cost per pixel. The
  first frames use whichever is smaller: 40% of the screen's resolution, or what fits `GPU_BUDGET_MS`
  (16 ms).
* **Probe frames** (`timedFrame`, `learnFromProbe`): about every 1.3 seconds one frame is timed the same
  way, and the resolution is reset to fit the budget. It drops at once if over budget, and rises gently:
  by at most 15% per probe, or 50% when a probe shows plenty of headroom, probing every 8 frames while it
  climbs. Probes are already sized to the budget, so waiting for them is harmless.
* A **late frame** (more than 55 ms since the previous one) cuts the resolution by a quarter at once.
* Hard limits: at most **30 frames a second**, at most **350,000 pixels** per frame (`PIXEL_CAP`), at least
  20% of the screen's resolution. If the lowest resolution is still over budget, the shader also takes
  fewer steps (`lowQuality`).
* The loop **pauses** in a background tab (`visibilitychange`) and when the canvas is scrolled out of
  view (`IntersectionObserver`, which also works inside an iframe).
* If the browser takes the GPU away anyway (`webglcontextlost`), the page shows the poster again and
  rebuilds when the context comes back.

### What the measurements showed

All numbers come from Chrome's software renderer (SwiftShader) on a busy 2-core machine, roughly a
thousand times slower than a real GPU, so compare them with each other, not with a phone:

| | Before | After |
|---|---|---|
| Shader compile (link + first draw) | 27–32 s | 2.3–3.2 s |
| Frame at 180×320, three-quarter view (fastest of 5) | 2129–3694 ms | 1028–1317 ms |
| Frame at 180×320, face close-up (fastest of 5) | 3044–3549 ms | 1639–1977 ms |
| Longest freeze of the page around the iframe at start | 26.6 s | 0.9–3.1 s |

The fur structure and wispy outline (section 5) account for roughly 25–30% of the new frame time.

## 15. Playing with it

* `?debug=1` shows only the sun shadow, `?debug=2` only ambient occlusion, `?debug=3` only the fur
  colour, `?debug=4` the (fur-bumped) normals.
* `?still&aa=2` is the screenshot mode: nothing animates, 2×2 rays per pixel, and
  `window.renderStill({yaw, pitch, zoom, time, focus: 'face'})` draws one frame and returns how long it
  took. Add `&scale=0.5` to render at half resolution.
* Good constants to tweak: `SUN_DIRECTION`, `SUN_COLOR` / `SKY_COLOR`, `SHADOW_SOFTNESS`, `EXPOSURE`, the
  palette in section 2, the proportions in section 4 (try different `EYE_RADII` or a longer
  `EAR_LENGTH`), the fur's `CLUMP_FREQUENCY` and `TUFT_LENGTH`, `tailRadius`, and the flame's
  `FLAME_HEIGHT`. On the JavaScript side, `GPU_BUDGET_MS` and `PIXEL_CAP` trade sharpness for speed.
