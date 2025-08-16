#!/bin/bash

python3 -m venv whisper-env
source whisper-env/bin/activate
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install openai-whisper