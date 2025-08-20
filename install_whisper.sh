#!/bin/bash

sudo apt install ffmpeg
mkdir whisper
cd whisper
python3 -m venv whisper-env
source whisper-env/bin/activate
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install openai-whisper
pip install faster-whisper-cli
echo "export PATH=$PWD/whisper-env/bin:$PATH" >> ~/.bashrc