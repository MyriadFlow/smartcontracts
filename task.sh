#!/bin/bash
ETHEREUM_RPC_URL="" yarn deploy:local;
cd subgraph && yarn codegen && yarn deploy-local -l v0.0.31 1>/dev/null