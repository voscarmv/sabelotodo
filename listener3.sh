#!/bin/bash

# source whisper-env/bin/activate
export LD_LIBRARY_PATH=./src/openssl-1.1.1w
echo start tables
node --env-file=.env tables.js
echo end tables
# echo $!
EXIT=false
PROF1=`cat profile1`
PROF2=`cat profile2`

while true ; do
    echo start loop
    # Start voice2json in background writing to fifo
    > record
    voice2json --profile $PROF2 transcribe-stream --open >> record &
    PID=$!
    echo $PID
    EXIT=false
    echo $EXIT
    # Just use an intermediate file and tail -f it duh
    # Read line by line
    while read line ; do
        > record # keep the file small
        echo "$line"
        if node wakeword.js "$line" "computadora"; then
            break
        fi
        if node wakeword.js "$line" "finaliza"; then
            EXIT=true
            echo $EXIT
            break
        fi
    done < <(tail -f record)
    echo $EXIT
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
        pico2wave -l es-ES -w bot.wav "Adios" && aplay bot.wav
        exit
    fi

    # espeak -p 0 -v spanish 'que onda'
    pico2wave -l es-ES -w bot.wav "Que onda" && aplay bot.wav
    # echo 'Hola mundo.' | festival --tts --language spanish

    # Continue with record-command
    voice2json --profile $PROF1 record-command > output.wav
    whisper -o . -f json --language es --model tiny output.wav
    cat output.json
    BOT=`node --env-file=.env chat.js "./output.json"`
    echo $BOT
    # espeak -p 0 -v spanish "$BOT"
    pico2wave -l es-ES -w bot.wav "$BOT" && aplay bot.wav

done