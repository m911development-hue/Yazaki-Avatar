#!/usr/bin/env python3
"""
Download the Prabhat piper TTS voice at Docker build time.
Lists what is actually in the HuggingFace repo before downloading,
so wrong filenames fail the build with a clear error.
"""
import os
import shutil
import sys

from huggingface_hub import hf_hub_download, list_repo_files

VOICE_DIR = "/app/voices"
REPO_ID = "rhasspy/piper-voices"
os.makedirs(VOICE_DIR, exist_ok=True)

# rhasspy/piper-voices may be a model repo or a dataset repo
repo_type = None
all_files = []
for rt in ("model", "dataset"):
    try:
        all_files = list(list_repo_files(REPO_ID, repo_type=rt))
        repo_type = rt
        print(f"[voice-dl] Repo type: {rt}  ({len(all_files)} files)")
        break
    except Exception as e:
        print(f"[voice-dl] Not a {rt} repo: {e}")

if not all_files:
    print("[voice-dl] ERROR: could not list repo files")
    sys.exit(1)

# Use hi_IN-pratham-medium (natural male Hindi voice — prabhat doesn't exist in piper)
TARGET = "hi/hi_IN/pratham/medium/hi_IN-pratham-medium.onnx"
matches = [f for f in all_files if f == TARGET]
print(f"[voice-dl] Target voice found: {bool(matches)}")

if not matches:
    indian = [f for f in all_files if ("hi_IN" in f or "en_IN" in f) and f.endswith(".onnx")]
    print(f"[voice-dl] Indian voices available: {indian}")
    print("[voice-dl] ERROR: target voice not found.")
    sys.exit(1)

voice_onnx = matches[0]
voice_json = voice_onnx + ".json"
voice_name = os.path.basename(voice_onnx).replace(".onnx", "")

for remote_path in (voice_onnx, voice_json):
    print(f"[voice-dl] Downloading {remote_path} ...")
    cached = hf_hub_download(REPO_ID, remote_path, repo_type=repo_type)
    dest = os.path.join(VOICE_DIR, os.path.basename(remote_path))
    shutil.copy(cached, dest)
    print(f"[voice-dl]   -> {dest}  ({os.path.getsize(dest):,} bytes)")

# Write the chosen name so tts.py resolves it at runtime
with open(os.path.join(VOICE_DIR, "selected_voice.txt"), "w") as f:
    f.write(voice_name)

print(f"[voice-dl] Done. Selected voice: {voice_name}")
