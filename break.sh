#!/bin/bash

./loop.sh | while read line ; do
    echo $line
    sleep 2
    if test $line = 5 ; then
        break
    fi
done