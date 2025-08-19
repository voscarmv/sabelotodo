#!/bin/bash

# For Ubuntu 25

sudo apt update
sudo apt install build-essential checkinstall zlib1g-dev -y

# Get openssl-1.1.1 https://openssl-library.org/source/old/1.1.1/

mkdir pkg src
wget -P pkg https://github.com/openssl/openssl/releases/download/OpenSSL_1_1_1w/openssl-1.1.1w.tar.gz
tar -xvf pkg/openssl-1.1.1w.tar.gz -C src
cd src/openssl-1.1.1w
./config
make
# sudo make install

# Get libffi http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
# Info https://boyter.org/posts/installing-voice2json-ubuntu/
# Other archs https://old-releases.ubuntu.com/ubuntu/pool/main/libf/libffi/
# For rasppi4 https://old-releases.ubuntu.com/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_arm64.deb

cd ../../pkg
wget http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
sudo apt install ./libffi6_3.2.1-8_amd64.deb

# Get voice2json https://voice2json.org/install.html#debian-package
# Consider installing from source https://voice2json.org/install.html#from-source
# For rasppi 4 arch https://github.com/synesthesiam/voice2json/releases/download/v2.1/voice2json_2.1_arm64.deb
# From https://voice2json.org/install.html#debian-package

wget https://github.com/synesthesiam/voice2json/releases/download/v2.1/voice2json_2.1_amd64.deb
sudo apt install ./voice2json_2.1_amd64.deb

# Test voice2json
# To run voice2json export the openssl-1.1.1w dir as LD_LIBRARY_PATH
# This allows it to run from the local shell without altering the host system

export LD_LIBRARY_PATH=../src/openssl-1.1.1w
# voice2json transcribe-wav --open < test.wav

# Generate profiles for appropriate timeouts when listening to wakeword and voice chat

DLOAD=`voice2json --profile es_kaldi-rhasspy download-profile`
DLPATH=`echo $DLOAD | sed 's/.* \//\//'`
DLDIR=`dirname $DLPATH`
cp -rvf $DLPATH "$DLDIR/es2"
cp ./profile.es_kaldi-rhasspy.yml "$DLPATH/profile.yml"
cp ./profile.es2.yml "$DLDIR/es2/profile.yml"
echo $DLPATH > profile1
echo "$DLDIR/es2" > profile2