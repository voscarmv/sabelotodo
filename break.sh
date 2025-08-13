#!/bin/bash

./loop.sh | while read line ; do
    echo $line
    if test $line = 5 ; then
        break
    fi
done