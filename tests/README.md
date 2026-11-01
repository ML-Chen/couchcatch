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
  `openCatchOn`, `flick`, `talkThrough`, `layoutOk`, ...).
- `tests.js`: the test cases.

## Tests

| # | What it checks |
|---|---|
| 01 | Page loads without errors and the starter picker shows 3 drawn starters |
| 02 | Picking a starter adds a Lv-5 creature and saves it to `localStorage.couchcatch2`. Reload restores the team, the staying mode and the creatures on the field |
| 03a | Staying spawns creatures over time. Even with forced spawns on every frame, the field never holds more than 7. Spawning stops at the quota of 15 |
| 03b | The quota is 5, then grows by 2 for each new place stayed at, up to 15. Staying at a place again does not raise it. The status text matches |
| 04 | A real mouse drag-and-flick from `cGeom().rest` (5 steps up) hits. A sideways flick misses, uses an orb and resets the streak. The step length is calibrated from the measured pointermove gap |
| 05 | A catch adds the creature, increments `S.streak`, counts the catch/first quests and gives XP. A timed Excellent/Great throw counts the `great` quest (regression: `q` shadowing). A Nice throw does not |
| 06 | During a gym battle while staying, a fainted creature stays at 0 HP through heal ticks and level-ups. After the battle, passive healing tops up hurt creatures but never revives fainted ones |
| 07 | Every evolution line evolves at Lv 18/36 (3 stages) or Lv 28 (2 stages). `gainXP` queues exactly the creatures that reach the threshold, and the evolution sheet evolves them |
| 08 | `shinyRate()` is 1/150, x2.5 in the Starveil Rift (index 6, not while travelling), +5% per streak up to x1.5. Sampled spawns agree |
| 09 | Habitat species spawn much more often at their habitats. Checked over 4000 samples per place, with San Diego (index 7) checked strictly |
| 10 | `pickBoss` picks valid bosses. `startRaid` through the raid button. A win opens a catch for the boss, which can be caught. A loss makes the raid leave |
| 11 | With the default settings, no word quiz opens during catches or battles and no `.saycard` appears. A positive control turns `S.qCatch` on to prove the monitor works |
| 12 | Learn, then Speak lesson, opens the lesson sheet. The first phrase is recorded in `S.ph` and saved. Answering "I got it" advances recall progress |
| 13 | Gym opens the `gym_backyard` conversation before the battle. The first tap only selects and the second confirms. A wrong answer shows a `.bub.fix` recast. The battle follows, and the second Gym press skips the chat. A fixture is used only if the build has no `gym_backyard` |
| 13b | Picking a starter opens `intro_neighbor`. Playing it through records it and gives its reward, and play continues |
| 14 | `ZH_AUDIO` has `你好` and a clip for every species' Chinese name (from `ZH_SPECIES`), the game's `segs()` covers each whole name, and every one of those clips decodes |
| 15 | At 360x629, the main screen (also with raid and rift banners), the catch sheet (also for a giant shiny legendary) and the battle sheet (also in the Rift with the longest names) have no horizontal overflow and at most 10 px of vertical overflow |
| 16 | After a broad play session, no LOG event and no log document written by `flushLog` (through a fake DB) contains nested arrays |
| 17 | No visible text in any state contains `undefined`/`NaN`. Covers every sheet, catch, battle, switch menu, raid and rift banners, travel and evolution, with one of every species in the team |
