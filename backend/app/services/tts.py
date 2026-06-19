import io
import os
import traceback
import wave

VOICE_DIR = os.environ.get("PIPER_VOICE_DIR", "/app/voices")
VOICE_MODEL = os.path.join(VOICE_DIR, "en_IN-prabhat-medium.onnx")

_voice = None


def _get_voice():
    global _voice
    if _voice is None:
        if not os.path.exists(VOICE_MODEL):
            raise FileNotFoundError(
                f"Piper model not found at: {VOICE_MODEL}  "
                f"(voices dir contains: {os.listdir(VOICE_DIR) if os.path.isdir(VOICE_DIR) else 'DIR NOT FOUND'})"
            )
        print(f"[TTS] Loading Piper voice from {VOICE_MODEL} ({os.path.getsize(VOICE_MODEL)} bytes)")
        from piper import PiperVoice
        _voice = PiperVoice.load(VOICE_MODEL)
        print("[TTS] Piper voice loaded successfully")
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
