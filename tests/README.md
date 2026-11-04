# Couchcatch end-to-end tests

Browser tests for the single-file game, driven by Playwright (Chromium, headless).

## Run

```sh
node /home/claude/tests/run.js                 # build the game, then test the build
node /home/claude/tests/run.js path/to/game.html   # test an already-built file
node /home/claude/tests/run.js --only=04,raid  # run tests whose name contains "04" or "raid"
node /home/claude/tests/run.js --list          # list test names
node /home/claude/tests/run.js --net           # allow network (real Google Fonts) instead of stubbing it
```

With no path, the runner runs `python3 build.py draw.js <out>` in `/home/claude` and tests `<out>`.
`<out>` is `/tmp/claude-0/-home-claude/503bd1cf-9502-5dcc-bafa-c1050294cb58/scratchpad/tests_build.html`
when that folder exists. Otherwise it is `$TMPDIR/couchcatch_tests_build.html`. Set
`COUCHCATCH_BUILD_OUT` to choose a different path.

The runner prints `PASS`/`FAIL` with a reason for each test and exits non-zero if any test fails.
A full run takes about 2 minutes. Playwright is preinstalled, so do not install it.

## What every test gets

- A fresh browser context (empty localStorage) with a 360x629 viewport, the size of the user's Android phone.
- The page loads over `file://`. Network requests (Google Fonts) are answered with empty responses so runs
  are hermetic. Use `--net` to load the real fonts.
- A test **fails** on any `pageerror` or `console.error`, on any LOG event that contains a nested array
  (Firestore rejects those), and on any visible text that contains `undefined` or `NaN`.
  These checks run after every test.
- Conversations (`runTalk`) are gated off unless a test opts in with `talk: [...keys]` or `talk: true`.
  Otherwise the neighbor's intro chat, gym chats, airport chats and arrival chats would cover the screen
  in tests about other things. The gate wraps `window.hasTalk`, the function the game itself uses
  to decide whether to start a chat.
- Waits are skipped through game globals: `lastSpawn`, `travelT`, `C.t0`, `E.t0`, `lastHeal`, ring `_skip()`.
  Some tests replace `speakAsync` with an instant resolver. Promises that wait for taps, like
  `runLesson()` and `runTalk()`, are never awaited from `page.evaluate`.

## Files

- `run.js`: the runner, the in-page helpers (`window.__TT`) and the test helpers (`start`, `stay`, `spawn`,
  `openCatchOn`, `flick`, `talkThrough`, `traceReal`, `waitReload`, `atSize`, `layoutOk`, ...).
- `tests.js`: the test cases.

## Tests

| # | What it checks |
|---|---|
| 01 | Page loads without errors and the starter picker shows 3 drawn starters |
| 02 | Picking a starter adds a Lv-5 creature and saves it to `localStorage.couchcatch2`. Reload restores the team, the staying mode and the creatures on the field |
| 03a | Staying spawns creatures over time. Even with forced spawns on every frame, the field never holds more than 7. Spawning stops at the quota of 15 |
| 03b | The quota is 5, then grows by 2 for each new place stayed at, up to 15. Staying at a place again does not raise it. The status text matches |
| 04 | A real mouse drag-and-flick from `cGeom().rest` (5 steps up) hits. A sideways flick misses, uses an orb and resets the streak. The step length is calibrated from the measured pointermove gap. Like 05, 10, 23 and 32 it uses `T.still()` (`catchMotion = false`), so the creature only sways |
| 05 | A catch adds the creature, increments `S.streak`, counts the catch/first quests and gives XP. A timed Excellent/Great throw counts the `great` quest (regression: `q` shadowing). A Nice throw does not |
| 06 | During a gym battle while staying, a fainted creature stays at 0 HP through heal ticks and level-ups. After the battle, passive healing tops up hurt creatures but never revives fainted ones |
| 07 | Every evolution line evolves at Lv 18/36 (3 stages) or Lv 28 (2 stages). `gainXP` queues exactly the creatures that reach the threshold, and the evolution sheet evolves them |
| 08 | `shinyRate()` is 1/150, x2.5 in the Starveil Rift (index 6, not while travelling), +5% per streak up to x1.5. Sampled spawns agree |
| 09 | Habitat species spawn much more often at their habitats. Checked over 4000 samples per place, with San Diego (index 7) checked strictly |
| 10 | `pickBoss` picks valid bosses (a final form with one of the place's types, or a grown legendary) at `raidLv`: progress + 4 + the place's nudge. `startRaid` through the raid button. A win opens a catch for the boss, which can be caught. A loss makes the raid leave |
| 11 | With the default settings, no word quiz opens during catches or battles and no `.saycard` appears. A positive control turns `S.qCatch` on to prove the monitor works |
| 12 | Learn, then Speak lesson, opens the lesson sheet. The first phrase is recorded in `S.ph` and saved. Answering "I got it" advances recall progress |
| 13 | Gym opens the `gym_backyard` conversation before the battle. The first tap only selects and the second confirms. A wrong answer shows a `.bub.fix` recast. The battle follows, and the second Gym press skips the chat. A fixture is used only if the build has no `gym_backyard` |
| 13b | Picking a starter opens `intro_neighbor`. Playing it through records it and gives its reward, and play continues |
| 14 | `ZH_AUDIO` has `你好` and a clip for every species' Chinese name (from `ZH_SPECIES`), the game's `segs()` covers each whole name, and every one of those clips decodes |
| 15 | At 360x629, the main screen (also with raid and rift banners), the catch sheet (also for a giant shiny legendary) and the battle sheet (also in the Rift with the longest names) have no horizontal overflow and at most 10 px of vertical overflow |
| 16 | After a broad play session, no LOG event and no log document written by `flushLog` (through a fake DB) contains nested arrays |
| 17 | No visible text in any state contains `undefined`/`NaN`. Covers every sheet, catch, battle, switch menu, raid and rift banners, travel and evolution, with one of every species in the team |
| 18 | Owed conversations survive a reload: the neighbor's intro, the first-arrival chat (which also waits for the "到达…" line) and the post-badge interview come back after the page is reloaded mid-chat, and are recorded once finished |
| 19 | A road trip and its road creatures wait while the catch spell (trace) or the catch screen is open; a catch never opens for a creature that left the field |
| 20 | Importing a save code replaces everything (field, trip, items); the "Tap again" label goes back to "Load" after 4 s |
| 21 | Stop ends the Speak lesson at once: no audio and no phrase recorded after it; a new lesson then works |
| 22 | Story: no "New goal" toast for a goal already met; the Starveil rift stays at Yosemite (and comes back if it was lost) until chapter 8 |
| 23 | Catch hints are Chinese with pinyin, play from recordings and are spoken (release without a flick, idle hint); the Spell button agrees with the spell, which is still on after the throw; no Spell without orbs |
| 24 | The daily Chinese quest counts conversation answers, lines said in the Speak lesson and traced characters (real mouse tracing); the "phrases said" tile matches the phrase list |
| 25 | Raid toast only for a raid that showed up; no "flight" labels from the Rift; a knock banner is gone on a trip; player names are text and an unnamed player is "Player N"; plurals |
| 26 | At 360x629 and 336x560: Settings fits, every reading reaches Done without scrolling, all status lines fit, map cards and battle titles fit; toasts sit below sheet headers |
| 27 | A creature past both evolution levels evolves twice; little kids get no level choice and no mic button; unfound book cards show only a silhouette |
| 28 | A cleared browser never overwrites the cloud: a fresh starter picked before the cloud answers is replaced by the richer cloud save |
| 29 | The first screen can load a save code instead of picking a starter; an imported save skips the opening conversation |
| 30 | Catch movement: with dodges off, a creature that darts away is missed by an orb aimed where it was and hit by one aimed where it lands; an orb under a jump that peaks at landing misses |
| 31 | Dodges, over many throws on a virtual clock (`VTHROWS`): a quick wind bird (Zipbeak Lv 25) tries to dodge at least 35% of throws and dodges at least 20%; a stone one (Pebblin) at most a third as often and only stomps; every dodge is a miss labelled "It dodged!" with 躲开了！ and pinyin shown and spoken; a little kid gets no moves, no dodges and every well-aimed orb hits |
| 32 | The catch spell calms the creature: dodge chance none > ok > perfect > 0, a Calm Berry lowers it, the sway shrinks; over 150 throws a perfect spell means fewer dodge attempts, more hits and hops under 80% as high |
| 33 | The catch spell is traced once when a creature is tapped, before the catch screen; it lasts through a miss and a break-free with no new trace; the traced character lands on the creature; the next catch starts from its own trace (ok = smaller, skipped = none); the Spell button still casts by hand |
| 34 | Wild levels follow progress, not the place: a fresh Lv-5 team meets Lv ~5 creatures at Yosemite (the Rift and road trips too); levels rise with the team, badges and story; raids sit 4 above, the nth gym is harder than the one before; little kids get a gentler band; the map shows each band; an old save (26 creatures, Lv 6-33, 4 badges) gets levels near its team and its Lv-31 Breezel evolves |
| 35 | Dual types: 30-50% of species have a second type; effectiveness multiplies (4x, 1x, 0.25x); a dual-type lead has a move of each type and the second traces its own ladder; a frost/bug creature spawns where bugs live; team cards, book cards and the battle show both types without overflow at 360x629 and 336x560 |
| 36 | Every species is in an evolution line; the first 70 keep their indexes (saves store species by index); every species has a Chinese name, toned pinyin, valid types, stats and drawn art; legendary babies spawn, grown legendaries lead raids; new lines evolve at Lv 28 |
| 37 | Battle lines are natural Chinese (潮獭喷出了水！) with pinyin and English, never 使用了; each line is the name clip then the action clip (a test fails once both are recorded but the line would still use the device voice; until then it lists what is missing) |
| 38 | Food stall (`food.js`): it stands only at the Hawker Centre, the Night Market and the Backyard (never while travelling), and a real tap on the cart opens it. Ordering with real taps offers only right answers (each place's dishes with drawn pictures, the spicy/ice follow-up, 谢谢！), and "I said it!" waits for a pick. The meal heals the team (fainted ones too) and gives XP, is logged and saved. Two meals a day per place, then a tap says 卖完了 (sold out); the next day it serves again; closing early costs nothing; an old save without `S.food` loads. Notes the food lines still to record |
| 39 | Food stall for a little kid: one answer at every turn, spoken before it is sent, with a picture and no English instruction (juice → 要冰的！ → 谢谢！). At 360x629 and 336x560 the cart is inside the scene and every stage of the ordering scene at all three stalls fits without scrolling, with the greeting visible and the keeper's name on one line |
| 47 | Interaction fixes: a tap picks the front creature under the finger, or the creature whose name tag was tapped; the catch spell card has Let it go, which returns to the field; reader buttons don't speak over the reading; catch-screen creatures stand on ground (not water); a curveball drifts sideways and lands where the aim line shows |
