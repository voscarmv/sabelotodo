#!/bin/bash

CTR=0
while true ; do
    echo $CTR;
    CTR=`echo "$CTR+1" | bc`
    sleep 1
done