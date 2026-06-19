import io
import wave
import os

VOICE_DIR = os.environ.get("PIPER_VOICE_DIR", "/app/voices")
VOICE_MODEL = os.path.join(VOICE_DIR, "hi_IN-prabhat-medium.onnx")

_voice = None

def _get_voice():
    global _voice
    if _voice is None:
        from piper import PiperVoice
        _voice = PiperVoice.load(VOICE_MODEL)
    return _voice

def synthesize(text: str) -> bytes:
    voice = _get_voice()
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        voice.synthesize(text, wav_file)
    buf.seek(0)
    return buf.read()
