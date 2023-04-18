#!/bin/bash
./task.sh
while inotifywait -e modify ./contracts ./scripts ./subgraph; do
	./task.sh
done