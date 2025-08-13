#!/bin/bash

./loop.sh | while read -t 5 line ; do
    echo $line
    sleep 2
    if test $line = 5 ; then
        break
    fi
done