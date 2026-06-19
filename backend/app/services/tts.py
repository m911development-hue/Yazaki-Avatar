import io
import os
import traceback
import wave

VOICE_DIR = os.environ.get("PIPER_VOICE_DIR", "/app/voices")


def _resolve_model_path() -> str:
    # Read voice selected at Docker build time
    selected = os.path.join(VOICE_DIR, "selected_voice.txt")
    if os.path.exists(selected):
        with open(selected) as f:
            voice = f.read().strip()
        path = os.path.join(VOICE_DIR, voice + ".onnx")
        if os.path.exists(path):
            return path

    # Fallback: pick the first .onnx file in the voice dir
    if os.path.isdir(VOICE_DIR):
        for fname in sorted(os.listdir(VOICE_DIR)):
            if fname.endswith(".onnx"):
                return os.path.join(VOICE_DIR, fname)

    raise FileNotFoundError(
        f"No .onnx voice file found in {VOICE_DIR}. "
        f"Contents: {os.listdir(VOICE_DIR) if os.path.isdir(VOICE_DIR) else 'DIR NOT FOUND'}"
    )


VOICE_MODEL = _resolve_model_path()
_voice = None


def _get_voice():
    global _voice
    if _voice is None:
        print(f"[TTS] Loading {VOICE_MODEL}  ({os.path.getsize(VOICE_MODEL):,} bytes)")
        from piper import PiperVoice
        _voice = PiperVoice.load(VOICE_MODEL)
        print("[TTS] Voice loaded OK")
    return _voice


def synthesize(text: str) -> bytes:
    try:
        voice = _get_voice()
    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Failed to load Piper voice: {e}")

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        voice.synthesize(text, wav_file)
    buf.seek(0)
    return buf.read()
