#!/usr/bin/env python3
"""Generate pre-recorded Mandarin clips for the game -> zh_audio.js

Strings come from tools/zh_strings.js (vocab.js VOCAB/PHRASES, phrases.js PHRASEBOOK/MOMENTS,
zh_names.js names, every dialogues*.js).  Every string is synthesized as ONE whole utterance
(never stitched from words), then:
  trim silence (keep 50 ms padding) -> 30 ms fades -> loudness-normalize to -16 LUFS (peak <= -1 dBFS)
  -> mono Ogg Opus ~24 kbps, speech mode, 24 kHz (--codec opus, default; decode with AudioContext.decodeAudioData)
     or MP3 CBR (--codec mp3); the bitrate steps down automatically to stay under --max-mb (default 7).
Output:  const ZH_AUDIO={"火":"data:audio/ogg;base64,...", ...};
Every finished take is cached as a WAV in --cache-dir, so changing codec/bitrate re-encodes from the source
(no re-synthesis, no lossy transcoding).

Engines (--engine):
  qwen    Qwen3-TTS-12Hz-0.6B-CustomVoice, speaker "Serena" (warm, gentle young female). Default.
          Needs torch + `pip install qwen-tts`; weights from ModelScope (Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice).
  kokoro  sherpa-onnx kokoro-multi-lang-v1_1 (Mandarin zf_* voices).
  matcha  sherpa-onnx matcha-icefall-zh-baker + vocos-22khz-univ (the original voice; non-commercial data licence).

Quality control (automatic):
  * single characters with a known pinyin (VOCAB / PHRASEBOOK build lists / pypinyin) are rendered several times
    and the take whose F0 contour matches the citation tone is kept (third tone must dip, see tools/zh_tone.py);
  * longer strings are checked by an ASR round trip (SenseVoice via sherpa-onnx, if --asr-dir exists): the take
    whose transcript matches the text in pinyin is kept, so skipped / repeated / garbled words get re-rolled.

Incremental: re-running only synthesizes keys missing from zh_audio.js (--force regenerates everything,
--redo 狗,鸟 regenerates the listed keys).  Existing keys are kept verbatim; the game looks clips up with
punctuation/spaces removed, so a key with or without punctuation both work.  Finished takes are cached in
--cache-dir, so an interrupted run resumes; zh_audio.js is only replaced once the whole run has finished.

Usage:
  python3 tools/make_audio.py [--engine qwen|kokoro|matcha] [--voice NAME] [--force] [--redo KEYS]
                              [--templates] [--model-dir DIR] [--asr-dir DIR]
"""
import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import unicodedata

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zh_tone import f0 as f0_track, classify as tone_classify  # noqa: E402

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(os.path.dirname(TOOLS), 'src')  # the game's source files
OUT = os.path.join(ROOT, 'zh_audio.js')
FFMPEG = os.environ.get('FFMPEG', '/usr/local/bin/ffmpeg' if os.path.exists('/usr/local/bin/ffmpeg') else 'ffmpeg')
CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'zh_tts')
DEFAULT_MODEL_DIR = os.environ.get('ZH_TTS_MODEL_DIR', CACHE)
DEFAULT_ASR_DIR = os.environ.get('ZH_ASR_DIR', os.path.join(CACHE, 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17'))

BITRATE = '64k'
TARGET_LUFS = -16.0
PEAK_MAX = 10 ** (-1 / 20)       # -1 dBFS
PAD_S, FADE_S = 0.050, 0.030
PUNCT = re.compile(r'[\s，。！？、…!?,.·:：；;"“”\'‘’()（）「」\-—]')
HAN = re.compile(r'[㐀-鿿]')
END = re.compile(r'[。！？!?.…]$')
TONE_MARK = {'̄': 1, '́': 2, '̌': 3, '̀': 4}


def norm(s):
    return PUNCT.sub('', str(s))


# ----------------------------------------------------------------------------- strings
def node_json(js, *args):
    return json.loads(subprocess.check_output(['node', '-e', js, *args]))


def collect_items(templates):
    items = json.loads(subprocess.check_output(['node', os.path.join(TOOLS, 'zh_strings.js'), ROOT]))
    return [it for it in items if templates or it.get('tier') != 'template']


def pinyin_map():
    """hanzi -> pinyin as written in the game data (VOCAB and PHRASEBOOK build lists)."""
    js = r"""const fs=require('fs'),vm=require('vm'),path=require('path');const root=process.argv[1];const sb={};sb.window=sb;
    const ctx=vm.createContext(sb);for(const f of ['vocab.js','phrases.js']){const p=path.join(root,f);if(fs.existsSync(p))try{vm.runInContext(fs.readFileSync(p,'utf8'),ctx)}catch(e){}}
    const g=vm.runInContext('({V:typeof VOCAB!=="undefined"?VOCAB:[],P:typeof PHRASEBOOK!=="undefined"?PHRASEBOOK:[]})',ctx);const m={};
    g.V.forEach(e=>{if(Array.isArray(e)&&e[1])m[e[0]]=e[1]});
    g.P.forEach(p=>{if(p.zh&&p.py)m[p.zh]=p.py;(p.build||[]).forEach(b=>{if(Array.isArray(b)&&b[1])m[b[0]]=b[1];else if(b&&b.zh&&b.py)m[b.zh]=b.py})});
    process.stdout.write(JSON.stringify(m))"""
    try:
        return node_json(js, ROOT)
    except Exception:
        return {}


def read_existing():
    if not os.path.exists(OUT):
        return {}
    try:
        return node_json(r"const fs=require('fs'),vm=require('vm');process.stdout.write(JSON.stringify("
                         r"vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8')+'\n;ZH_AUDIO',{})))", OUT)
    except Exception as e:
        print('warning: could not parse existing zh_audio.js:', e, file=sys.stderr)
        return {}


def citation_tone(text, pymap):
    """Tone number (1-4) of a single character, from game pinyin or pypinyin; None if unknown/neutral."""
    py = pymap.get(text)
    if py:
        for ch in unicodedata.normalize('NFD', py):
            if ch in TONE_MARK:
                return TONE_MARK[ch]
        return None
    try:
        from pypinyin import pinyin, Style
        t = pinyin(text, style=Style.TONE3, heteronym=False)[0][0]
        return int(t[-1]) if t[-1] in '1234' else None
    except Exception:
        return None


# ----------------------------------------------------------------------------- engines
class Qwen:
    name = 'qwen3-tts-0.6b-customvoice'

    def __init__(self, model_dir, voice, dtype='auto'):
        import torch
        from qwen_tts import Qwen3TTSModel
        torch.set_num_threads(max(1, os.cpu_count() or 1))
        self.torch = torch
        if dtype == 'auto':  # bf16 is ~2x faster on CPUs with AVX512-BF16/AMX and sounds the same
            try:
                flags = open('/proc/cpuinfo').read()
            except OSError:
                flags = ''
            dtype = 'bf16' if ('avx512_bf16' in flags or 'amx_bf16' in flags) else 'fp32'
        path = model_dir if os.path.exists(os.path.join(model_dir, 'config.json')) else os.path.join(model_dir, 'Qwen3-TTS-12Hz-0.6B-CustomVoice')
        if not os.path.exists(os.path.join(path, 'config.json')):
            sys.exit(f'Qwen3-TTS weights not found in {path}\n  pip install modelscope && modelscope download --model '
                     f'Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice --local_dir {path}')
        self.m = Qwen3TTSModel.from_pretrained(path, device_map='cpu', dtype=torch.bfloat16 if dtype == 'bf16' else torch.float32)
        self.voice = voice or 'Serena'
        self.tag = f'{self.name}/{self.voice}'

    def __call__(self, texts, seed):
        self.torch.manual_seed(seed)
        wavs, sr = self.m.generate_custom_voice(text=texts, speaker=[self.voice] * len(texts), language=['Chinese'] * len(texts),
                                                temperature=0.7, top_k=30, subtalker_temperature=0.7, max_new_tokens=160)
        return [np.asarray(w, np.float32).reshape(-1) for w in wavs], sr


class Sherpa:
    def __init__(self, engine, model_dir, voice):
        import sherpa_onnx
        p = lambda *a: os.path.join(model_dir, *a)
        if engine == 'kokoro':
            m = p('kokoro-multi-lang-v1_1')
            mc = sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=f'{m}/model.onnx', voices=f'{m}/voices.bin', tokens=f'{m}/tokens.txt',
                lexicon=f'{m}/lexicon-us-en.txt,{m}/lexicon-zh.txt'), num_threads=max(1, os.cpu_count() or 1))
            fsts = f'{m}/phone-zh.fst,{m}/date-zh.fst,{m}/number-zh.fst'
            self.sid = int(voice) if voice else 13  # zf_019
        else:
            m = p('matcha-icefall-zh-baker')
            mc = sherpa_onnx.OfflineTtsModelConfig(matcha=sherpa_onnx.OfflineTtsMatchaModelConfig(
                acoustic_model=f'{m}/model-steps-3.onnx', vocoder=p('vocos-22khz-univ.onnx'),
                lexicon=f'{m}/lexicon.txt', tokens=f'{m}/tokens.txt'), num_threads=max(1, os.cpu_count() or 1))
            fsts = f'{m}/phone.fst,{m}/date.fst,{m}/number.fst'
            self.sid = int(voice) if voice else 0
        cfg = sherpa_onnx.OfflineTtsConfig(model=mc, rule_fsts=fsts, max_num_sentences=1)
        if not cfg.validate():
            sys.exit(f'invalid sherpa-onnx config for {engine} in {model_dir}')
        self.tts = sherpa_onnx.OfflineTts(cfg)
        self.tag = f'{engine}/sid{self.sid}'
        self.speed = 1.0

    def __call__(self, texts, seed):
        out, sr = [], 24000
        for t in texts:
            sp = 0.9 if len(norm(t)) == 1 else 1.0
            a = self.tts.generate(t, sid=self.sid, speed=sp * (1 - 0.05 * (seed // 1000)))  # vary takes slightly
            out.append(np.asarray(a.samples, np.float32)); sr = a.sample_rate
        return out, sr


# ----------------------------------------------------------------------------- QC
class Asr:
    def __init__(self, d):
        import sherpa_onnx
        self.r = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=f'{d}/model.int8.onnx', tokens=f'{d}/tokens.txt',
                                                                language='zh', use_itn=False, num_threads=max(1, os.cpu_count() or 1))

    def __call__(self, x, sr):
        z = np.zeros(int(sr * .3), np.float32)
        s = self.r.create_stream(); s.accept_waveform(sr, np.concatenate([z, x, z])); self.r.decode_stream(s)
        return norm(s.result.text)


def py_seq(s, tones=True):
    try:
        from pypinyin import lazy_pinyin, Style
        return lazy_pinyin(s, style=Style.TONE3 if tones else Style.NORMAL, neutral_tone_with_five=True)
    except Exception:
        return list(s)


def lev(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (ca != cb))
    return d[len(b)]


# ----------------------------------------------------------------------------- audio
def trim(x, sr, thresh_db=-45.0):
    hop = max(1, sr // 100)
    n = len(x) // hop
    if n == 0:
        return x
    db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    idx = np.where(db > db.max() + thresh_db)[0]
    if len(idx) == 0:
        return x
    pad = int(sr * PAD_S)
    return x[max(0, idx[0] * hop - pad):min(len(x), (idx[-1] + 1) * hop + pad)]


def fades(x, sr):
    n = min(int(sr * FADE_S), len(x) // 4)
    if n > 1:
        w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))
        x = x.copy(); x[:n] *= w; x[-n:] *= w[::-1]
    return x


def split_syllables(x, sr, gap_s=0.08, thresh_db=-30.0):
    """Split a carrier take ("狗，狗。") at internal pauses; returns the pieces (or [x] if no clean pause)."""
    hop = max(1, sr // 100)
    n = len(x) // hop
    if n < 10:
        return [x]
    db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9)
    on = db > db.max() + thresh_db
    runs, s = [], None
    for i, v in enumerate(on):
        if v and s is None:
            s = i
        elif not v and s is not None:
            runs.append([s, i]); s = None
    if s is not None:
        runs.append([s, n])
    merged = []
    for r in runs:  # merge runs separated by less than gap_s (stop closures inside a syllable)
        if merged and r[0] - merged[-1][1] < gap_s * 100:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    merged = [r for r in merged if r[1] - r[0] >= 15]  # >= 150 ms of voice
    if len(merged) < 2:
        return [x]
    pad = int(sr * PAD_S)
    return [x[max(0, a * hop - pad):min(len(x), b * hop + pad)] for a, b in merged]


def lufs(x, sr):
    """ITU-R BS.1770-4 integrated loudness (mono)."""
    from scipy.signal import lfilter
    A = 10 ** (3.999843853973347 / 40); w = 2 * np.pi * 1681.974450955533 / sr; al = np.sin(w) / (2 * 0.7071752369554196)
    b1 = [A * ((A + 1) + (A - 1) * np.cos(w) + 2 * np.sqrt(A) * al), -2 * A * ((A - 1) + (A + 1) * np.cos(w)),
          A * ((A + 1) + (A - 1) * np.cos(w) - 2 * np.sqrt(A) * al)]
    a1 = [(A + 1) - (A - 1) * np.cos(w) + 2 * np.sqrt(A) * al, 2 * ((A - 1) - (A + 1) * np.cos(w)),
          (A + 1) - (A - 1) * np.cos(w) - 2 * np.sqrt(A) * al]
    w = 2 * np.pi * 38.13547087602444 / sr; al = np.sin(w) / (2 * 0.5003270373238773)
    b2 = [(1 + np.cos(w)) / 2, -(1 + np.cos(w)), (1 + np.cos(w)) / 2]; a2 = [1 + al, -2 * np.cos(w), 1 - al]
    y = lfilter(b2, a2, lfilter(b1, a1, x.astype(np.float64)))
    blk, hop = int(0.4 * sr), int(0.1 * sr)
    if len(y) < blk:
        z = np.array([np.mean(y ** 2)])
    else:
        z = np.array([np.mean(y[i:i + blk] ** 2) for i in range(0, len(y) - blk + 1, hop)])
    L = -0.691 + 10 * np.log10(z + 1e-12)
    z = z[L > -70]
    if len(z) == 0:
        return -70.0
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z2 = z[(-0.691 + 10 * np.log10(z)) > rel]
    return float(-0.691 + 10 * np.log10((z2 if len(z2) else z).mean()))


def finish(x, sr):
    x = np.nan_to_num(np.asarray(x, np.float32))
    x = x - x.mean() if len(x) else x
    x = fades(trim(x, sr), sr)
    g = 10 ** ((TARGET_LUFS - lufs(x, sr)) / 20)
    pk = float(np.abs(x).max()) if len(x) else 0
    if pk * g > PEAK_MAX:
        g = PEAK_MAX / pk
    return (x * g).astype(np.float32)


def encode_mp3(x, sr, bitrate=BITRATE):
    cmd = [FFMPEG, '-hide_banner', '-loglevel', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', 'pipe:0',
           '-ac', '1', '-c:a', 'libmp3lame', '-b:a', bitrate, '-map_metadata', '-1', '-id3v2_version', '0', '-f', 'mp3', 'pipe:1']
    return subprocess.run(cmd, input=np.clip(x, -1, 1).astype('<f4').tobytes(), stdout=subprocess.PIPE, check=True).stdout


def encode_opus(x, sr, bitrate='22k'):
    """Ogg Opus, speech-tuned (SILK/hybrid). Opus runs at 8/12/16/24/48 kHz; 24 kHz input is passed through."""
    cmd = [FFMPEG, '-hide_banner', '-loglevel', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', 'pipe:0',
           '-ac', '1', '-ar', str(sr if sr in (8000, 12000, 16000, 24000, 48000) else 24000), '-c:a', 'libopus', '-b:a', bitrate,
           '-application', 'voip', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-f', 'ogg', 'pipe:1']
    return subprocess.run(cmd, input=np.clip(x, -1, 1).astype('<f4').tobytes(), stdout=subprocess.PIPE, check=True).stdout


def encode(x, sr, codec, bitrate):
    return encode_opus(x, sr, bitrate) if codec == 'opus' else encode_mp3(x, sr, bitrate)


def engine_tag(args):
    if args.engine == 'qwen':
        return f'{Qwen.name}/{args.voice or "Serena"}'
    return f'{args.engine}/sid{int(args.voice) if args.voice else (13 if args.engine == "kokoro" else 0)}'


def save_wav(path, x, sr):
    import wave
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def load_wav(path):
    import wave
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32767, w.getframerate()


# ----------------------------------------------------------------------------- main
def tts_text(t):
    t = t.strip()
    return t if END.search(t) else t + '。'


def score(x, sr, text, tone, asr, lo_hi):
    """Lower is better. Returns (score, note)."""
    dur = len(x) / sr
    nchar = len(HAN.findall(text))
    pen = 0.0
    if dur < 0.25 or dur > max(1.2, 0.55 * nchar + 0.8):   # implausible length: skipped words / babbling
        pen += 5
    if np.sqrt(np.mean(x ** 2)) < 0.01:
        pen += 10
    note = f'{dur:.2f}s'
    if tone and lo_hi:
        g, d = tone_classify(f0_track(x, sr), *lo_hi)
        note += f' T{tone}->T{g} {d}'
        if g != tone:
            pen += 3
        elif tone == 3:                                        # desc = "start-min@pos-end" on the 1..5 Chao scale
            m = re.match(r'([\d.]+)-([\d.]+)@[\d.]+-([\d.]+)', d)
            if m and float(m.group(3)) - float(m.group(2)) < 1.0:
                pen += 1.0                                     # re-roll for the full 214 dip-and-rise learners expect
    elif asr and nchar >= 2 and (hyp := asr(x, sr)) is not None:
        ref = norm(text)
        e0 = lev(py_seq(ref, False), py_seq(hyp, False)); e1 = lev(py_seq(ref), py_seq(hyp))
        pen += 2 * e0 + 0.5 * e1
        note += f' asr={hyp}'
    return pen, note


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--engine', default='qwen', choices=['qwen', 'kokoro', 'matcha'])
    ap.add_argument('--voice', default=None, help='qwen speaker name (default Serena) / sherpa speaker id')
    ap.add_argument('--dtype', default='auto', choices=['auto', 'bf16', 'fp32'], help='qwen only')
    ap.add_argument('--model-dir', default=DEFAULT_MODEL_DIR)
    ap.add_argument('--asr-dir', default=DEFAULT_ASR_DIR)
    ap.add_argument('--cache-dir', default=os.path.join(CACHE, 'clips'))
    ap.add_argument('--force', action='store_true', help='regenerate every clip')
    ap.add_argument('--redo', default='', help='comma-separated keys to regenerate')
    ap.add_argument('--templates', action='store_true', help='also record sentence templates (野生的X ...)')
    ap.add_argument('--prune', action='store_true', help='drop clips for strings no longer used')
    ap.add_argument('--extra', action='append', default=[], help='text file of extra strings, one per line (repeatable)')
    ap.add_argument('--tries', type=int, default=3, help='max takes per string (best one is kept)')
    ap.add_argument('--single-tries', type=int, default=4, help='max takes per single character')
    ap.add_argument('--batch', type=int, default=0, help='utterances per model call (default 32 for qwen)')
    ap.add_argument('--batch-chars', type=int, default=120, help='max (utterances x longest length) per model call')
    ap.add_argument('--codec', default='opus', choices=['opus', 'mp3'],
                    help='opus = Ogg Opus 24 kHz speech mode (default; Chrome/Firefox/Safari 17+), mp3 = MP3 CBR')
    ap.add_argument('--max-mb', type=float, default=7.0, help='step the bitrate down (opus 24k->20k, mp3 64k->40k) to stay under this size')
    ap.add_argument('--limit', type=int, default=0, help='only synthesize this many (testing)')
    ap.add_argument('--out', default=OUT)
    args = ap.parse_args()
    batch = args.batch or (32 if args.engine == 'qwen' else 1)

    items = collect_items(args.templates)
    pymap = pinyin_map()
    old = read_existing()
    old_by_norm = {norm(k): k for k in old}
    # key -> text to speak. Existing keys are kept verbatim; new keys use the string as written.
    want = {}
    for it in items:
        want.setdefault(old_by_norm.get(it['key'], it['text']), it['text'])
    if not args.prune:
        for k in old:
            want.setdefault(k, k)
    have = {norm(k) for k in want}
    prio = {}  # synthesis order: single characters, then game strings, then each --extra file in the order given
    for fi, f in enumerate(args.extra, 1):  # extra strings, one per line (kept on later runs: they are then in zh_audio.js)
        for line in open(f, encoding='utf-8'):
            s = line.strip()
            if s and HAN.search(s) and norm(s) not in have:
                have.add(norm(s))
                want[s] = s
                prio[s] = fi
    redo_n = {norm(r) for r in args.redo.split(',') if r}
    clips = {} if args.force else {k: v for k, v in old.items() if k in want and norm(k) not in redo_n}
    todo = [k for k in want if k not in clips]
    if args.limit:
        todo = todo[:args.limit]
    print(f'{len(want)} keys wanted, {len(clips)} kept, {len(todo)} to synthesize', flush=True)
    fresh = {}   # key -> (wav path) for clips made by this run (re-encodable)
    engine_desc = 'unchanged'

    tag = engine_tag(args)
    os.makedirs(args.cache_dir, exist_ok=True)
    cbase = lambda k: os.path.join(args.cache_dir, hashlib.sha1(f'{tag}|{want[k]}'.encode()).hexdigest()[:20])
    lazy = {}

    def tts(texts, seed):  # the model is only loaded if something actually needs synthesizing
        if 'tts' not in lazy:
            lazy['tts'] = Qwen(args.model_dir, args.voice, args.dtype) if args.engine == 'qwen' else Sherpa(args.engine, args.model_dir, args.voice)
        return lazy['tts'](texts, seed)

    def asr(x, sr):
        if 'asr' not in lazy:
            ok = os.path.exists(os.path.join(args.asr_dir, 'model.int8.onnx'))
            lazy['asr'] = Asr(args.asr_dir) if ok else None
            if not ok:
                print('note: no ASR model in --asr-dir; multi-character takes are not round-trip checked', flush=True)
        return lazy['asr'](x, sr) if lazy['asr'] else None

    if todo:
        engine_desc = tag
        singles = [k for k in todo if len(norm(want[k])) == 1]
        multis = [k for k in todo if k not in singles]
        t0, report, state = time.time(), [], {'lo_hi': None, 'n': 0}

        def meta(k):
            p = cbase(k) + '.json'
            return json.load(open(p)) if os.path.exists(p) else None

        def keep(k, s, x, sr, note):
            save_wav(cbase(k) + '.wav', x, sr)
            json.dump({'key': k, 'text': want[k], 'tag': tag, 'score': s, 'note': note, 'dur': len(x) / sr},
                      open(cbase(k) + '.json', 'w'), ensure_ascii=False)

        def run(keys, tries, single):
            # --redo keys get new takes, but a cached take is only replaced by a better-scoring one
            best = {k: m['score'] for k in keys if (m := meta(k))}
            if single and state['lo_hi'] is None:  # speaker F0 range from earlier cached takes, if any
                pool = [k for k in want if len(norm(want[k])) == 1 and os.path.exists(cbase(k) + '.wav')]
                if len(pool) >= 20:
                    fs = np.concatenate([f[f > 0] for f in (f0_track(*load_wav(cbase(k) + '.wav')) for k in pool)])
                    state['lo_hi'] = (float(np.percentile(fs, 5)), float(np.percentile(fs, 95)))
                    print(f'  speaker F0 range {state["lo_hi"][0]:.0f}-{state["lo_hi"][1]:.0f} Hz (cached takes)', flush=True)
            pending = [k for k in keys if k not in best or norm(k) in redo_n or (best[k] >= 1 and not meta(k).get('final'))]
            for attempt in range(tries):
                pending.sort(key=lambda k: (prio.get(k, 0), len(want[k])))
                nxt = []
                groups, cur = [], []
                for k in pending:  # memory grows with batch x length: cap characters per batch, not just utterances
                    if cur and (len(cur) >= batch or (len(cur) + 1) * (len(norm(want[k])) + 2) > args.batch_chars):
                        groups.append(cur); cur = []
                    cur.append(k)
                if cur:
                    groups.append(cur)
                for i, grp in enumerate(groups):
                    # Single characters: every other take (every take with --redo) is said twice in a carrier
                    # "狗，狗。" and each copy is a candidate -- sentence-trained models often flatten an isolated syllable.
                    carrier = {k: single and (attempt % 2 == 1 or norm(k) in redo_n) for k in grp}
                    texts = [f'{norm(want[k])}，{norm(want[k])}。' if carrier[k] else tts_text(want[k]) for k in grp]
                    wavs, sr = tts(texts, seed=1000 * attempt + i)
                    for k, w in zip(grp, wavs):
                        tone = citation_tone(norm(want[k]), pymap) if single else None
                        cands = [finish(seg, sr) for seg in split_syllables(finish(w, sr), sr)] if carrier[k] else [finish(w, sr)]
                        for x in cands:
                            s, note = score(x, sr, want[k], tone, asr, state['lo_hi'])
                            if carrier[k]:
                                note += ' (carrier)'
                            if k not in best or s < best[k]:
                                best[k] = s
                                keep(k, s, x, sr, note)
                        if (best[k] >= 1 or (norm(k) in redo_n and best[k] > 0)) and attempt + 1 < tries:
                            nxt.append(k)
                    el = time.time() - t0
                    state['n'] += len(grp)
                    print(f'  try{attempt + 1} [{state["n"]} takes, {el:.0f}s, {el / state["n"]:.1f}s/take] ' +
                          ' | '.join(f'{k}:{best[k]:.1f}' for k in grp), flush=True)
                if single and state['lo_hi'] is None and best:  # speaker F0 range, then re-score the first pass
                    pool = [k for k in want if len(norm(want[k])) == 1 and os.path.exists(cbase(k) + '.wav')]
                    fs = [f[f > 0] for f in (f0_track(*load_wav(cbase(k) + '.wav')) for k in pool)]
                    fs = np.concatenate(fs) if fs else np.array([200.0])
                    state['lo_hi'] = (float(np.percentile(fs, 5)), float(np.percentile(fs, 95)))
                    print(f'  speaker F0 range {state["lo_hi"][0]:.0f}-{state["lo_hi"][1]:.0f} Hz', flush=True)
                    nxt = []
                    for k in list(best):
                        x, sr = load_wav(cbase(k) + '.wav')
                        s, note = score(x, sr, want[k], citation_tone(norm(want[k]), pymap), asr, state['lo_hi'])
                        best[k] = s
                        keep(k, s, x, sr, note)
                        if s >= 1:
                            nxt.append(k)
                pending = nxt
                if not pending:
                    break
            for k in keys:
                m = meta(k)
                if m:
                    m['final'] = True
                    json.dump(m, open(cbase(k) + '.json', 'w'), ensure_ascii=False)
                    if m['score'] >= 1:
                        report.append(f"{k} ({m['note']})")

        run(singles, args.single_tries, True)
        run(multis, args.tries, False)
        for k in todo:
            if os.path.exists(cbase(k) + '.wav'):
                fresh[k] = cbase(k) + '.wav'
        el = time.time() - t0
        print(f'synthesized {len(todo)} clips ({state["n"]} takes) in {el:.0f}s ({el / max(1, len(todo)):.1f}s/clip)')
        if report:
            print('kept the best take but still flagged (check by ear):\n  ' + '\n  '.join(report))

    # Encode every clip that has a cached take (this run's and earlier ones) with one codec; step the
    # bitrate down if the file would exceed --max-mb. Clips without a cached take are kept as they are.
    for k in want:
        if k not in clips and k not in fresh and os.path.exists(cbase(k) + '.wav'):
            fresh[k] = cbase(k) + '.wav'
    for k in clips:
        if k not in fresh and os.path.exists(cbase(k) + '.wav'):
            fresh[k] = cbase(k) + '.wav'
    order = [k for k in want if k in clips or k in fresh]
    kept_bytes = sum(len(k.encode()) + len(v) + 8 for k, v in clips.items() if k not in fresh)
    if kept_bytes:
        print(f'  {sum(1 for k in clips if k not in fresh)} clips have no cached take and are kept as they are', flush=True)
    pcm = {k: load_wav(p) for k, p in fresh.items()}
    ladder = ('24k', '22k', '20k', '18k', '16k') if args.codec == 'opus' else ('64k', '56k', '48k', '40k')
    mime = 'audio/ogg' if args.codec == 'opus' else 'audio/mpeg'
    for br in ladder:
        bitrate = br
        enc = {k: f'data:{mime};base64,' + base64.b64encode(encode(x, sr, args.codec, br)).decode('ascii') for k, (x, sr) in pcm.items()}
        total = kept_bytes + sum(len(k.encode()) + len(v) + 8 for k, v in enc.items())
        if total <= args.max_mb * 1e6 or not pcm:
            break
        print(f'  {total / 1e6:.2f} MB at {br}bps > --max-mb {args.max_mb}; trying a lower bitrate', flush=True)
    clips.update(enc)
    body = ',\n'.join(json.dumps(k, ensure_ascii=False) + ':' + json.dumps(clips[k]) for k in order)
    fmt = f'Ogg Opus {bitrate}bps (decode with AudioContext.decodeAudioData)' if args.codec == 'opus' else f'MP3 {bitrate}bps'
    hdr = (f'// Generated by tools/make_audio.py ({tag}) -- pre-recorded Mandarin clips, one whole utterance each, '
           f'mono {fmt}, {TARGET_LUFS:g} LUFS.\n// Keys are the strings as written; look up with punctuation/spaces removed.\n')
    tmp = args.out + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(hdr + 'const ZH_AUDIO={\n' + body + '\n};\n')
    os.replace(tmp, args.out)
    print(f'wrote {args.out}: {len(order)} clips, {os.path.getsize(args.out) / 1e6:.2f} MB, {args.codec} {bitrate}bps')


if __name__ == '__main__':
    main()
