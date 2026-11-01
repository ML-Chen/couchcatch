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
3. Works out which way the surface faces there, the **normal** (`calcNormal`).
4. Decides what colour the fur is at that spot (`paintFur`).
5. Lights it: sun, sky, bounce light, shadows, occlusion, rim glow (`shadeFur`, `shadeEye`, `shadeNose`).
6. Adds the glowing flame on top (`addFlame`).
7. Converts the result into displayable colour (`toneMap`, gamma, dither).

The JavaScript at the bottom of the file does the "puppeteering". Every frame `poseFox` works out where
the head is turned, how far the eyelids are closed, where the tail is swinging, and so on. It hands those
numbers to the shader as **uniforms** (values that are the same for every pixel). The shader only ever
draws "the fox in this pose".

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
together, but only 0.008 for the eyelids.

**Smooth maximum** (`smoothMax`) does the opposite job. `max(A, B)` keeps only where *both* shapes are
(an intersection), and `max(A, -B)` carves B out of A. The ear (`earDistance`) uses both. Its outline is
a round cone, intersected with a slab (`abs(z) < halfThickness`) to make it thin. Then a smaller cone
(`earCupDistance`) is carved out of the front to make the inner-ear cup.

The eyes and nose are added with a plain `min`, not a smooth one. Their edges should be crisp, and they
carry their own **material number** (`MATERIAL_EYE`, `MATERIAL_NOSE`) so the renderer knows to shade
them differently.

### Local spaces and mirroring

The head turns, so its parts are modelled in **head space**. `toHeadSpace` moves a world point so the
skull's centre is the origin, then rotates it by the inverse of the head's rotation. The skull, snout,
eyes and ears are then written as if the head never moved. Ears and eyes have their own spaces again
(`toEarSpace`, `toEyeSpace`), so "along the ear" is simply `+y`.

Smoldy is symmetric, so most parts are modelled only on the right side and mirrored with `abs(x)`. A
point on the left side is reflected onto the right before being measured. Four legs cost the same as two.

### Skipping work safely

The full distance function is fairly expensive, and it is called hundreds of times per pixel. `foxSDF`
skips the tail and the head when even their **bounding spheres** are further away than the body, since
then they cannot change the answer. One tempting shortcut, "return the distance to the bounding sphere
instead", is *wrong* here. That distance is too small, and the shadow and occlusion code reads small
distances as "fur right next to me". The first renders had dark rings on the ground and black streaks
on the body for exactly that reason.

## 2. Ray marching (sphere tracing)

Now the clever part. If the distance function says the nearest surface is 0.3 away, then a sphere of
radius 0.3 around the current point is guaranteed empty, so we can safely jump 0.3 along the ray. Repeat:
measure, jump, measure, jump. Near a surface the jumps get tiny, and when the distance falls below a
small threshold we call it a hit. That is `castRay`. Details worth noticing:

* It first intersects the ray with the fox's bounding sphere (`sphereIntersect`). Rays that miss it
  never march at all, which is most of the screen.
* Each step moves only 90% of the distance (`* 0.9`), because a few of the shapes are estimates rather
  than exact distances.
* It is capped at `MAX_MARCH_STEPS` so a phone never gets stuck.

### Smooth silhouettes for free

While marching, `castRay` also tracks the smallest ratio `distance / travelled`. That ratio is the
*angle* by which the ray clears the fox. If a ray misses but that angle is smaller than one pixel
(`gPixelAngle`), the fox's edge pokes into this pixel. `render` then shades the nearest point on the fox
and blends it in by that coverage. This anti-aliases the outline, which matters a lot when the phone is
rendering at reduced resolution.

## 3. Normals from the distance field

Lighting needs to know which way the surface faces. The distance grows fastest in the direction pointing
straight out of the surface, so the normal is the **gradient** of the SDF. `calcNormal` estimates it by
sampling the distance at four points arranged like the corners of a tetrahedron around the hit point,
and adding up the corner directions weighted by those distances. That is four samples instead of the
obvious six (plus and minus x, y and z).

## 4. Painting: what colour is the fur here?

`paintFur` decides the fur colour at a surface point using **masks**: numbers from 0 to 1 made with
`smoothstep`, so colours fade into each other instead of having hard edges. Working in head or ear space
again makes this easy:

* Orange base coat, a little deeper on surfaces facing up, like a real fox's darker back.
* Cream **bib** (a region of the chest), cream **muzzle** (everything on the face below a line that rises
  towards the cheeks), cream **tail tip** (the tail's `t` above about 0.75).
* Dark **socks**: simply everything lower than a certain height.
* **Ears**: cream-pink inside the cup, dark at the tip.
* **Blush**: a soft pink spot on each cheek. **Mouth**: a short stroke and a curved smile drawn as
  distance-to-a-curve on the snout. **Lash line**: a dark edge on the eyelid while blinking.

Colours are written as sRGB numbers (`FUR_ORANGE_SRGB` is the game's `#ff8a3d`) and converted with
`toLinear`. Light adds up physically only in *linear* units; screens expect *gamma-encoded* sRGB. Mixing
the two is the classic cause of muddy, too-dark CG.

`paintFur` returns a small `FurPaint` record: the colour plus two masks the lighting needs, "is this an
ear?" and "is this inside an ear cup?".

## 5. Lighting the fur

`shadeFur` adds up several light sources. Each term is one line, and each one fixes a specific "this
looks fake" problem:

* **Sun with wrap lighting.** Ordinary diffuse light is `max(dot(normal, sunDirection), 0)`. It drops to
  black exactly at 90°, which looks like hard plastic. Wrap lighting lets it continue a bit past the
  terminator (`(dot + 0.35) / 1.35`), the way light scatters through fur.
* **Soft shadow** from the sun (see below), with a **coloured penumbra**: `pow(shadow, (1.0, 1.25, 1.6))`
  makes green and blue fade faster than red, so shadow edges glow warm, like light passing through skin.
* **Sky dome:** cool blue light from above, stronger on surfaces facing up, dimmed by ambient occlusion.
* **Ground bounce:** warm light from below, on surfaces facing down.
* **Light scattered in the fur:** a term tinted by the fur colour itself. Without it, shadowed orange fur
  lit only by the blue sky turns grey-brown. With it, shadows stay a rich orange.
* **Ear translucency:** when the sun is behind an ear, the ear glows warm, like fingers held over a torch.
* **Fuzz / rim:** at grazing angles (`1 + dot(normal, rayDir)` near 1), many hair tips catch the light,
  so silhouettes get a soft glow. This is the Fresnel-style sheen.
* A very faint specular **sheen**. Strong highlights are what make fur look like plastic.

**Fur detail** (`furNormal`) nudges the normal with noise that is *stretched along the direction the
fur grows* (`furFlow`: backwards along the body, down the legs, out along the tail), so light picks out
soft streaks of hair. Two subtleties:

* The noise is looked up in the **rest pose** (`restPosePosition`): the head's turn and the tail's swing
  are undone first. Otherwise the fur pattern would slide across Smoldy like a projected slide whenever
  it moved.
* Each noise layer **fades out** when it would be smaller than a couple of pixels (`pixelSize`).
  Detail finer than a pixel does not look like detail, it looks like flicker. The fine "strand" layer
  only appears when the camera is close.

## 6. Soft shadows

`softShadow` marches from the surface towards the sun using the same distance function. At each step it
compares the distance to the nearest surface with the distance travelled. If the ray slips past an ear
with only a tiny gap, that ratio is small, so the point is in partial shadow. The smallest ratio along
the ray becomes the shadow amount. Shadows come out soft, and softer the further the blocker is from
the surface they fall on, just like a real penumbra. `SHADOW_SOFTNESS` sets how wide the penumbra is.

There is a refined "improved" version of this technique, but it assumes every step is exactly the
distance returned. Combined with a minimum step size, it produced a jagged false shadow on Smoldy's
forehead, so this file uses the classic version. The search region is a padded bounding sphere. Without
the padding, the penumbra of rays that only just miss the fox would stop abruptly and draw an arc on
the ground.

## 7. Ambient occlusion

Sky light reaches open, convex surfaces easily, and creases (under the chin, between the legs, where
paws touch the ground) much less. `ambientOcclusion` steps a few short distances out along the normal and
checks the distance function there. If the scene is closer than how far we stepped, something is crowding
this point. It is cheap and it is what makes the fox sit *on* the grass. The ground uses the same function
for its contact shadow under the paws, faded out smoothly at the edge of the area where it is computed.
For the fur, occlusion is kept above 0.2: even deep creases get some bounced light. It is also lifted
inside the ear cups, where real light bounces between the walls.

## 8. Eyes, nose and blinking

`shadeEye` makes the eyes glassy. They are mostly **reflection**: the sky colour reflected in the eye,
stronger at grazing angles (the Fresnel effect), and a tight sun highlight. Then come two **catchlights**,
the bright spots that make cartoon eyes look alive (the 2D art has one big glint and a tiny sparkle).
They are imaginary lights fixed relative to the camera: up-left and down-right. If the reflected
direction points at one of them, the pixel gets a crisp white spot. Because they move with the camera,
Smoldy has sparkly eyes from every angle. The bottom of each eye warms to brown, like light glowing up
through an iris.

**Blinking** uses real eyelids (`eyelidsDistance`). A furry shell slightly larger than the eye is cut by
a level that slides down from above (upper lid) and up from below (lower lid) as `uBlink` goes from 0 to
1. Both levels droop at the corners, so the closed eye forms a soft, content arch with a painted lash
line. An earlier attempt squashed the eye itself; the distance estimate for the squashed shape was poor
and the closed eye came out ragged.

## 9. The flame

The flame is not a solid surface. It is a glowing **volume**. `flameField` gives, for any point, how much
fire is there (density) and how hot it is (heat). Its shape is a teardrop (a round cone) whose edge is
broken up by noise (`fbm`, layered value noise) that scrolls upwards over time. The flame licks and
flickers, calm at the base and wild at the tip.

`addFlame` marches through the flame's bounding sphere in `FLAME_STEPS` equal slices, stopping at any
solid surface in front (so the tail tip correctly hides the bottom of the flame). This is the standard
**emission-absorption** model: each slice glows with `flameColor(heat)` and hides a little of what is
behind it. Thin noisy edges are see-through; the thick middle is nearly solid. `flameColor` goes from deep
red-orange at the edges, through orange and yellow, to near-white at the core: the same three layers as
the 2D flame. Hotter fire is also brighter, so only the core blooms to white.

Two extras sell it. A soft **halo** around the flame stands in for light scattering in the air, and
`flameLight` throws warm light onto the nearby fur and grass. Each slice starts at a random offset per
pixel, which turns banding (visible slice edges) into invisible fine noise.

## 10. Sky, ground and haze

`skyColor` is a gradient from a pale, warm horizon to blue overhead, brighter towards the sun. The ground
is the plane `y = 0`, hit with a single division instead of marching. `meadowColor` blends two greens
with large-scale noise, plus a softer, sunnier patch under Smoldy like a little stage. Far-away ground
fades into the horizon colour (**depth haze**), so there is no hard horizon line.

## 11. From light to pixels: tone mapping and gamma

Lighting produces values above 1.0: sunlit cream fur, the flame core. A screen cannot show them, so
`toneMap` squeezes them into range with a smooth curve. This file uses the Khronos "PBR Neutral" curve
rather than the popular ACES curve. ACES shifts saturated colours, and Smoldy's orange came out
yellow-peach. PBR Neutral scales all three channels by the same factor, which keeps the hue, and only
fades the very brightest light (the flame core) towards white. `EXPOSURE` plays the role of a camera's
exposure setting; it was tuned until the rendered fur came out close to the game's `#ff8a3d`.

Then `main` applies **gamma** (`pow(color, 1/2.2)`, back to the sRGB the screen expects), a gentle
**vignette**, and **dithering**: less than one 8-bit step of random noise, which hides banding in the
smooth sky gradient.

## 12. Animation (JavaScript, section B)

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

## 13. Camera and interaction (sections D–F)

The camera orbits a target point: yaw (around), pitch (up/down), zoom (distance). Pointer events update
*target* values: one finger drags, two fingers pinch, the mouse wheel zooms. Each frame `updateCamera`
moves the *current* values a fraction of the way towards the targets (`1 - exp(-dt * 7)`). That is
exponential smoothing, which gives the same damped glide at 30 or 120 frames per second. Until the first
touch, the camera slowly spins on its own.

## 14. Running well on a phone

* **Reduced, adaptive resolution** (`adaptResolution`, `resizeCanvas`): the canvas draws fewer pixels than
  the screen has and the browser scales it up. If frames get slower than about 40 per second, the scale
  drops; if there is headroom for a while, it creeps back up.
* **Bounding spheres** everywhere: for primary rays, shadow rays, the flame volume, and the head and tail
  inside the distance function.
* **Capped loops**: `MAX_MARCH_STEPS`, `MAX_SHADOW_STEPS`, `FLAME_STEPS`.
* **One triangle** covering the screen, and plain WebGL 1 shading language, for the widest device support.
* **Context loss**: if the browser takes the GPU away, the page pauses, rebuilds the shaders when it gets
  it back (`setUpGpu`), and continues at a lower resolution.

## 15. Playing with it

* `?debug=1` shows only the sun shadow, `?debug=2` only ambient occlusion, `?debug=3` only the fur
  colour, `?debug=4` the normals. These are the views used to track down the bugs mentioned above.
* `?still&aa=2` is the screenshot mode: nothing animates, 2×2 rays per pixel, and
  `window.renderStill({yaw, pitch, zoom, time, focus: 'face'})` draws one frame.
* Good constants to tweak: `SUN_DIRECTION`, `SUN_COLOR` / `SKY_COLOR`, `SHADOW_SOFTNESS`, `EXPOSURE`, the
  palette in section 2, the proportions in section 4 (try a bigger `SKULL_RADII` or longer `EAR_LENGTH`),
  `tailRadius`, and the flame's `FLAME_HEIGHT` and noise strength in `flameField`.
