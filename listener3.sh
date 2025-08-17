#!/bin/bash

source whisper-env/bin/activate
export LD_LIBRARY_PATH=/usr/local/src/openssl-1.1.1w
node --env-file=.env tables.js
echo $!

while true ; do
    # Start voice2json in background writing to fifo
    > record
    voice2json --profile ~/.local/share/voice2json/es2 transcribe-stream --open >> record &
    PID=$!
    echo $PID
    EXIT=false
    # Just use an intermediate file and tail -f it duh
    # Read line by line
    tail -f record | while read line ; do
        > record # keep the file small
        echo "$line"
        if node wakeword.js "$line" "computadora"; then
            break
        fi
        if node wakeword.js "$line" "terminacion"; then
            EXIT=true
            break
        fi
    done

    # Recursively collect all descendants of a given PID
    list_descendants() {
    local parent=$1
    local children
    children=$(ps -o pid= --ppid "$parent")
    for pid in $children; do
        list_descendants "$pid"
    done
    echo "$children"
    }

    # # Example usage: Replace <PID> with the PID of the process tree to kill/wait for
    target_pid=$PID

    # # Gather PIDs of all descendants
    descendants=$(list_descendants "$target_pid")

    # # Kill all descendant processes
    kill $descendants

    # # Wait for each descendant to exit
    wait $descendants

    # # Finally, kill the target parent
    kill "$target_pid"

    # # Optionally, wait for the parent to exit (useful if you want to be thorough)
    wait "$target_pid"

    # kill -- -$PID
    # wait $descendants
    # wait $PID

    if $EXIT ; then
        exit
    fi

    espeak -p 0 -v spanish 'que onda'

    # Continue with record-command
    voice2json --profile ~/.local/share/voice2json/es_kaldi-rhasspy record-command > output.wav
    whisper -o . -f json --language es --model tiny output.wav
    cat output.json
    BOT=`node --env-file=.env chat.js "./output.json"`
    echo $BOT
    espeak -p 0 -v spanish "$BOT"
done