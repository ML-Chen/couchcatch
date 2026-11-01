# Couchcatch — notes for working on this repo

Couchcatch is a single-file browser game: you stay in one place and original creatures come to you. Its real purpose is helping kids hear and speak everyday Mandarin through immersion. It has two kinds of player: a "big kid" who reads English but not Chinese characters, and a "little kid" (little-kid mode) who can't reliably read English yet and barely knows Chinese, so everything must work through sound and pictures.

## Build, check, publish

- Sources are in `src/`. `src/game.html` is the template; `src/build.py` inlines every module at its `//@@MARKER@@` and writes one self-contained page:
  `cd src && python3 build.py draw.js ../dist/couchcatch.html`
- One-step check (build, script syntax check, standard screenshots, contact sheet, e2e tests):
  `tools/build_and_check.sh src dist/couchcatch.html /tmp/shots --tests`
  Look at `/tmp/shots/sheet.png` after every change: it shows every screen at the kids' phone size (360x629) and is how UI regressions get caught. `errors.txt` beside it lists page errors.
- Setup for tests/screenshots: `npm install` then `npx playwright install chromium`.
- GitHub Pages: the `gh-pages` branch holds only `index.html` (a copy of `dist/couchcatch.html`) and `.nojekyll`. Refresh it on every release as a single force-pushed commit so the branch never accumulates copies of the 9 MB page. Outside Claude, saves stay in the browser only (use Settings → Save code to move progress).
- The game is published as a Claude artifact. In a Claude session, publish `dist/couchcatch.html` with the Artifact tool, passing the existing artifact URL as `url` (the owner must have given you edit access). Keep the declared capabilities: `{db:{rules:[{path:"logs",read:"admin",write:"admin"},{path:"logs/{self}",read:"interact",write:"interact"}]},user:{}}`. Saves live in each viewer's private `data/users/<id>/` space; action logs (for bug-hunting) go to `logs/<viewer id>/chunks/…` and only the owner can read all of them.

## Module map (src/)

| File | What it does |
|---|---|
| game.html | Main loop, catching, battles, places, travel, saves, logging, UI |
| species.js | Creature data. Saves store creatures by array index: only ever APPEND species |
| draw.js | Procedural creature art (cached frames). fx.js: effects and item icons. orb.js: glass orbs |
| scenery_home.js, scenery_ca.js | Painted backgrounds per place |
| zh_names.js, vocab.js, phrases.js | Chinese names; beginner words; phrasebook for the Speak lesson |
| dialogues.js, story_dialogues.js | Conversations (format: title/who/setting/turns/end/reward). Only `ok:true` options are shown |
| speak.js | Audio playback (whole-sentence clips → device Chinese voice → trimmed stitched word clips), Speak lesson, conversation player, avatars |
| trace.js, hanzi_writer.js, hsk_chars.js | Character tracing: per-type ladders, then all HSK 1–4 characters; Hanzi Writer + stroke data |
| reader.js, readings.js, story_readings.js | Papers lying around → narrated graded reader |
| story.js | The Little Star story arc: chapter triggers, goals, the floating companion |
| types_ext.js | Extra creature types (if present): mutates TYPES/STRONG/MOVES/PLACES, adds tracing ladders |
| theme_glass.css | The glass UI theme (loaded last) |
| zh_audio.js | Recorded Mandarin clips (Ogg Opus, base64). Keys are the Chinese text |

## Rules the family has asked for

- Chinese with pinyin everywhere Chinese appears; English small underneath (hidden at higher levels).
- No Pokémon names, art or other IP anywhere. Everything original.
- Learning is immersion and whole phrases (Pimsleur-like), not quizzes. Speaking prompts never interrupt catching or battling; conversations gate key moments and the child taps "I said it" herself. Never offer wrong answers in conversations.
- Tapping a creature opens the catch spell (trace a character) before the catch screen. Moves and going Giant also need a traced character.
- Audio should be whole, smooth sentences. Any new Chinese line the game speaks should get a recorded clip (see tools/make_audio.py); otherwise it falls back to the device voice or stitched words.
- Content must fit on the phone screen without scrolling; the play area never resizes.
- No clutter: no explanatory subtitles, eyebrow text or long instructions.
- Every build: run the screenshots and look at them.
