#!/usr/bin/env node
// Every line the companion (src/companion.js) can ever say, enumerated from its templates x the trace ladders and phrasebook.
//   node tools/companion_lines.js [srcDir] [--write]   -> prints the lines (one per line, exactly as spoken);
//                                                         --write also writes tools/new_lines/companion.txt
// Used by tools/zh_strings.js so make_audio.py records them.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

function companionLines(root) {
  const sb = { console: { log() {}, warn() {}, error() {} }, setTimeout() {}, setInterval() {},
    document: { createElement: () => ({}), head: { appendChild() {} } } };
  sb.window = sb; sb.self = sb; sb.globalThis = sb;
  const ctx = vm.createContext(sb);
  const run = f => { const p = path.join(root, f); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f }); };
  // types_ext.js only adds EXTRA_TRACE_SETS here (its table edits are guarded); trace.js builds TRACE_SETS
  for (const f of ['types_ext.js', 'trace.js']) { try { run(f); } catch (e) { /* tables the tool does not need */ } }
  run('phrases.js');
  delete sb.document; // companion.js then defines only the line set
  run('companion.js');
  const book = vm.runInContext('typeof PHRASEBOOK!=="undefined"?PHRASEBOOK:[]', ctx);
  return sb.companionLines ? sb.companionLines(sb.TRACE_SETS, book) : [];
}
module.exports = { companionLines };

if (require.main === module) {
  const args = process.argv.slice(2), root = path.resolve(args.find(a => !a.startsWith('--')) || path.join(__dirname, '..', 'src'));
  const lines = companionLines(root).map(l => l.zh);
  const text = lines.join('\n') + '\n';
  if (args.includes('--write')) {
    const out = path.join(__dirname, 'new_lines', 'companion.txt');
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, text);
    process.stderr.write(`${lines.length} lines -> ${out}\n`);
  } else process.stdout.write(text);
}
