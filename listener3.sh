#!/bin/bash

source whisper-env/bin/activate
export LD_LIBRARY_PATH=/usr/local/src/openssl-1.1.1w

# Start voice2json in background writing to fifo
> record
voice2json --profile ~/.local/share/voice2json/es2 transcribe-stream --open >> record &
PID=$!

LISTENING=true
# Just use an intermediate file and tail -f it duh
# Read line by line
tail -f record | while read line ; do
    echo "$line"

    if node wakeword.js "$line"; then
        LISTENING=false
        break
    fi
done

kill $PID
wait $PID
espeak -p 0 -v spanish 'que onda'

# Continue with record-command
voice2json --profile ~/.local/share/voice2json/es_kaldi-rhasspy record-command > output.wav
whisper -o . -f json --language es --model tiny output.wav
cat output.json
