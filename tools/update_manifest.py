#!/usr/bin/env python3
"""Writes the update manifest for a game build: which file, its version, size and SHA-256.

    python3 tools/update_manifest.py dist/couchcatch.html --version 1793551604 > manifest.json

The Android app trusts a downloaded build only if this manifest carries a valid signature from the
project's update key (tools/sign_update.py) and the downloaded file matches the size and hash listed here.
The version is the commit time of the game sources, so newer commits always get bigger numbers.
"""
import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

ap = argparse.ArgumentParser()
ap.add_argument('game')
ap.add_argument('--version', type=int, required=True)
args = ap.parse_args()

data = open(args.game, 'rb').read()
manifest = {
    'app': 'couchcatch',
    'file': 'index.html',
    'version': args.version,
    'built': datetime.fromtimestamp(args.version, timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'size': len(data),
    'sha256': hashlib.sha256(data).hexdigest(),
}
sys.stdout.write(json.dumps(manifest, separators=(',', ':')) + '\n')
