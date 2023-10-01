#!/bin/bash
export NODE_OPTIONS=--openssl-legacy-provider
npm config set legacy-peer-deps true
npm run install-all
