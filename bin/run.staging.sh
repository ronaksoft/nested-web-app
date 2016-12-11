#!/bin/sh

gulp build --mode=staging
gulp git-version --mode=staging
npm i -g http-server
cd dist/staging
http-server -p 3000
