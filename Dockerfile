FROM node:6-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g local-web-server
EXPOSE 80

COPY ./bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./bin/dns-discovery.js /bin/dns-discovery.js
COPY ./run.sh .
CMD  /bin/sh run.sh

# Install app dependencies
COPY ./build/desktop /usr/src/app/desktop
COPY ./build/mobile /usr/src/app/mobile
