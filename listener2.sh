#!/bin/bash

source whisper-env/bin/activate
export LD_LIBRARY_PATH=/usr/local/src/openssl-1.1.1w
LISTENING=true

mkfifo fifo
voice2json --profile ~/.local/share/voice2json/es2 transcribe-stream --open | \
# voice2json transcribe-stream --open | \
while read line ; do
    echo $line
    # if $LISTENING ; then
        if node wakeword.js "$line" ; then
            # LISTENING=false
            espeak -p 0 -v spanish 'que onda'
            break
        fi
    # fi
done 

voice2json --profile ~/.local/share/voice2json/es_kaldi-rhasspy record-command > output.wav
whisper -o . -f json --language es --model tiny output.wav
cat output.json