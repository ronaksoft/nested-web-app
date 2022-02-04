FROM node:8.2.1-alpine as Builder

# we copy the root
COPY ./ /ronak/src/desktop

ENV BUILD_DIR=/ronak/src/desktop/build
ENV VERSION=v1

## Build Desktop
WORKDIR /ronak/src/desktop
RUN apk add --update python build-base
RUN apk add git
RUN npm install -g bower
RUN npm install
RUN bower install
RUN cp -fR ./modified_components/* ./bower_components/
RUN npm rebuild node-sass
RUN ./node_modules/.bin/gulp build --mode=production --ver=$VERSION
RUN mkdir -p $BUILD_DIR/webapp
RUN mkdir -p $BUILD_DIR/webapp/t
RUN mkdir -p $BUILD_DIR/webapp/oauth
RUN mkdir -p $BUILD_DIR/webapp/firebase
RUN cp -a ./bin/token/. $BUILD_DIR/webapp/t/
RUN cp -a ./bin/oauth/. $BUILD_DIR/webapp/oauth/
RUN cp -a ./bin/firebase/. $BUILD_DIR/webapp/firebase/
RUN cp ./bin/firebase/firebase-messaging-sw.js $BUILD_DIR/webapp/
RUN cp -r ./dist/production/* $BUILD_DIR/webapp
RUN cp ./lws.config.js $BUILD_DIR/webapp
RUN mkdir -p $BUILD_DIR/bin
RUN cp -a ./bin/. $BUILD_DIR/bin
RUN find . -type f -not -name \*.html -not -name print.css -exec rm -rf {} \;
RUN rm -rf ./src/index.html
RUN cp -a ./src/. $BUILD_DIR/webapp

# Build Mobile APP
WORKDIR /ronak/src/mobile
RUN git clone git@github.com:ronaksoft/nested-web-mobile.git .
RUN npm install
RUN npm run build:prod
RUN mkdir -p $BUILD_DIR/webapp/m
RUN cp -a ./build/m $BUILD_DIR/webapp


# Build Admin APP
WORKDIR /ronak/src/admin
RUN npm install gulp -g
RUN npm install jspm -g
RUN apk update && apk upgrade && apk add --no-cache bash git openssh
RUN cd /var/lib/admin
RUN git clone git@github.com:ronaksoft/nested-web-admin.git .
RUN npm install
RUN jspm install
RUN ./node_modules/.bin/gulp build
RUN mkdir -p $BUILD_DIR/webapp/admin
RUN cp -r ./dist/* $BUILD_DIR/webapp/admin

FROM node:8.2.1-alpine

# Create app directory
WORKDIR /ronak/nested
RUN apk update
RUN apk add gettext
RUN apk add nginx

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

RUN npm install -g local-web-server

EXPOSE 80
EXPOSE 443

# Install app dependencies
COPY --from=Builder /ronak/src/desktop/build/webapp /ronak/nested/webapp

COPY ./bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./bin/dns-discovery.js /bin/dns-discovery.js
COPY ./bin/nginx.conf.template /bin/nginx.conf.template
COPY ./bin/nginx-ssl.conf.template /bin/nginx-ssl.conf.template
COPY ./run.sh .
RUN chmod +x run.sh
CMD  /bin/sh run.sh

