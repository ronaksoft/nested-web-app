#!/bin/sh

npm install
bower install  --allow-root
npm rebuild node-sass

gulp serve
