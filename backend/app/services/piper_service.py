import os
import subprocess
import tempfile

_HERE = os.path.dirname(os.path.abspath(__file__))
_BASE_DIR = os.path.dirname(os.path.dirname(_HERE))

# On Linux/Render: /opt/piper/piper (installed in Dockerfile)
# On Windows local dev: set PIPER_PATH env var to your piper.exe
PIPER_EXECUTABLE = os.getenv("PIPER_PATH", "/opt/piper/piper")

MODEL_PATH = os.getenv(
    "PIPER_MODEL",
    os.path.join(_BASE_DIR, "models", "piper", "en_IN-prabhat-medium.onnx"),
)


def generate_speech(text: str) -> str:
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")

    # Add piper's directory to LD_LIBRARY_PATH so bundled .so files are found
    piper_dir = os.path.dirname(PIPER_EXECUTABLE)
    env = os.environ.copy()
    if piper_dir and os.path.isdir(piper_dir):
        env["LD_LIBRARY_PATH"] = piper_dir + ":" + env.get("LD_LIBRARY_PATH", "")

    subprocess.run(
        [PIPER_EXECUTABLE, "--model", MODEL_PATH, "--output_file", temp_file.name],
        input=text,
        text=True,
        check=True,
        env=env,
    )

    return temp_file.name
