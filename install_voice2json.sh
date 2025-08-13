#!/bin/bash

# For Ubuntu 25

sudo apt update
sudo apt install build-essential checkinstall zlib1g-dev -y

# Get openssl-1.1.1 https://openssl-library.org/source/old/1.1.1/

wget -P pkg https://github.com/openssl/openssl/releases/download/OpenSSL_1_1_1w/openssl-1.1.1w.tar.gz
tar -xvf pkg/openssl-1.1.1w.tar.gz -C src
cd src/openssl-1.1.1w
./config
sudo make
sudo make install

# Get libffi http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
# Info https://boyter.org/posts/installing-voice2json-ubuntu/

cd ../../pkg
wget http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
sudo apt install ./libffi6_3.2.1-8_amd64.deb

# Get voice2json https://voice2json.org/install.html#debian-package

wget https://github.com/synesthesiam/voice2json/releases/download/v2.1/voice2json_2.1_amd64.deb
sudo apt install ./voice2json_2.1_amd64.deb

# Test voice2json
# To run voice2json export the openssl-1.1.1w dir as LD_LIBRARY_PATH
# This allows it to run from the local shell without altering the host system

export LD_LIBRARY_PATH=../src/openssl-1.1.1w
voice2json transcribe-wav --open < test.wav
