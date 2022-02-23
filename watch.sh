#!/bin/bash
task () {
	ETHEREUM_RPC_URL="" yarn deploy:local;
	cd subgraph && yarn deploy-local -l v0.0.1 && cd -
}

task
while inotifywait -e modify ./contracts; do
	task
done