#!/bin/sh

npm install
bower --allow-root install
npm rebuild node-sass

gulp serve
