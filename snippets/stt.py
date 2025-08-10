import pyaudio
import whisper
import openwakeword
import webrtcvad
import time

# Initialize components
model = whisper.load_model("small")
oww = openwakeword.Model()  # includes VAD support
vad = webrtcvad.Vad(2)

# Audio setup
stream = pyaudio.PyAudio().open(...)

buffer = bytearray()
silence_start = None
SILENCE_LIMIT = N  # in seconds

while True:
    frame = stream.read(...)  # designed for openWakeWord frames
    if oww.predict(frame).get("your_wakeword", 0) > threshold:
        print("Wake word detected—start recording speech")
        buffer.clear()
        silence_start = None
        while True:
            chunk = stream.read(...)
            buffer.extend(chunk)
            if not vad.is_speech(chunk, 16000):
                silence_start = silence_start or time.time()
                if time.time() - silence_start >= SILENCE_LIMIT:
                    print("Silence detected—transcribing…")
                    break
            else:
                silence_start = None
        result = model.transcribe(bytes(buffer))
        print("Transcription:", result["text"])
# Repeat loop
