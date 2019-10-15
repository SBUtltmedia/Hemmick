#!/usr/bin/env bash
cd "$(dirname "$0")"
for i in *.mp4; do echo file \'$i\'; done > mylist.txt
ffmpeg -y -f concat -safe 0 -i mylist.txt output/output.mp4
