FROM node:8.2.1-alpine

# Create app directory
RUN mkdir -p /ronak/nested
WORKDIR /ronak/nested
RUN npm install -g local-web-server
EXPOSE 80

COPY ./bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./bin/dns-discovery.js /bin/dns-discovery.js
COPY ./run.sh .
CMD  /bin/sh run.sh

# Install app dependencies
COPY ./build/desktop /ronak/nested/desktop
COPY ./build/mobile /ronak/nested/mobile
