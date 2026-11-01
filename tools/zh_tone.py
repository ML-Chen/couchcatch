#!/usr/bin/env python3
"""Crude Mandarin citation-tone check for single-syllable clips from the F0 contour.
f0(x, sr) -> per-10ms F0 (Hz, 0 = unvoiced).  classify(f0, lo, hi) -> (tone guess 1-4, shape description)."""
import numpy as np


def f0(x, sr, fmin=110, fmax=500):
    x = np.asarray(x, np.float64)
    hop, win = sr // 100, int(sr * 0.04)
    lmin, lmax = int(sr / fmax), int(sr / fmin)
    rms_all = np.sqrt((x ** 2).mean()) + 1e-9
    out = []
    for s in range(0, len(x) - win - lmax, hop):
        a = x[s:s + win + lmax]
        if np.sqrt((a[:win] ** 2).mean()) < 0.25 * rms_all:
            out.append(0.0); continue
        # YIN difference function
        w = a[:win]
        d = np.array([np.sum((w - a[t:t + win]) ** 2) for t in range(lmin, lmax)])
        cm = d * np.arange(1, len(d) + 1) / (np.cumsum(d) + 1e-12)
        i = np.argmin(cm)
        if cm[i] > 0.35:
            out.append(0.0); continue
        if 0 < i < len(d) - 1:  # parabolic interpolation
            den = d[i - 1] - 2 * d[i] + d[i + 1]
            i = i + (0.5 * (d[i - 1] - d[i + 1]) / den if den else 0)
        out.append(sr / (lmin + i))
    return np.array(out)


def semis(f, ref):
    return 12 * np.log2(f / ref)


def classify(f, lo, hi):
    """lo/hi: speaker's F0 range in Hz (e.g. 5th/95th pct over many clips). Returns (tone, desc)."""
    v = f[f > 0]
    if len(v) < 5:
        return 0, 'unvoiced'
    # octave-error correction, trim onset/offset transients, 5-point median smoothing
    med = np.median(v)
    v = np.where(v < med * 0.62, v * 2, np.where(v > med * 1.6, v / 2, v))
    k = max(1, len(v) // 8)
    v = v[k:len(v) - k] if len(v) > 2 * k + 5 else v
    if len(v) >= 5:
        v = np.array([np.median(v[max(0, i - 2):i + 3]) for i in range(len(v))])
    s = semis(v, lo)
    span = semis(np.array([hi]), lo)[0]
    lvl = lambda z: 1 + 4 * np.clip(z / span, 0, 1)  # Chao 1..5 scale
    n = len(s); q = max(1, n // 5)
    a, m, b = lvl(np.median(s[:q])), lvl(s.min()), lvl(np.median(s[-q:]))
    imin = int(np.argmin(s)) / max(1, n - 1)
    rise, fall = b - m, a - m
    desc = f'{a:.1f}-{m:.1f}@{imin:.2f}-{b:.1f}'
    if a - b > 1.4 and imin > 0.6:
        tone = 4 if a >= 3.3 else 3       # high fall = T4, low fall (half-3rd) = T3
    elif rise > 1.0 and fall > 0.7 and 0.15 < imin < 0.85:
        tone = 3                           # dipping
    elif b - a > 1.0 and imin < 0.45:
        tone = 2 if m >= 2.0 or fall < 0.7 else 3
    elif abs(b - a) <= 1.0 and max(a, b) - m < 1.0:
        tone = 1 if min(a, b) >= 3.2 else 3
    else:
        tone = 3 if m < 2.0 else (4 if a > b else 2)
    return tone, desc
