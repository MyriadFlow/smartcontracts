#!/bin/bash
task () {
	yarn deploy:local;
	cd subgraphs/creatify && yarn deploy-local -l v0.0.1 && cd ../..
	cd subgraphs/marketplace && yarn deploy-local -l v0.0.1 && cd ../..
}

task
while inotifywait -e modify ./contracts; do
	task
done