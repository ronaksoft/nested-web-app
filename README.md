# Nested Webapp Project

## Introduction
Nested web application source repository.
## Installation


##Requirements
Nested web application has been developed based on  angularJs 1.5.x and has many inside library. You must installed NodeJs, bower and gulp for developing or building application.
You can also use Decker container for developing or building. Pull this image from : `registry.ronaksoftware.com/nested/web-app:0.0.2:dev`

### Git essentials for developer in Mac:

Nested requires [node.js](https://nodejs.org/en/download) to run

before clone you need to create Sshkey
```sh
$ git clone [git-repo-url]
$ cd nested
$ npm install
$ bower install
```

### Structure
Sources are located in `src` directory.
```
/app
/assets
/nested
favicon.ico
index.html
```


## Docker Images and containers
Nested has three types of docker image for staging, beta release and production.

 |Image | Tags  | Branch  | API End Point   |  Dockerfile Name  |
 | ------------ | ------------ | ------------ | ------------ | ------------ |
 | Production | webapp:x.y.z  | master  | production  | Dockerfile-production   |
 | Beta Release | webapp:beta-x.y.z  | develop  | production   |    Dockerfile-production |
 | Staging | webapp:stg-x.y.z  |  develop  |  staging  |  Dockerfile-staging  |

Images can be download from  `registry.ronaksoftware.com/nested/[image-tag]`.
