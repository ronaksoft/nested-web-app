FROM node:8.2.1-alpine

# Create app directory
RUN mkdir -p /ronak/nested
WORKDIR /ronak/nested
RUN apk update
RUN apk add ca-certificates
RUN apk add gettext
RUN apk add nginx
EXPOSE 80
EXPOSE 443

COPY ./bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./bin/nginx.conf.template /bin/nginx.conf.template
COPY ./bin/nginx-ssl.conf.template /bin/nginx-ssl.conf.template
COPY ./run.sh .

# Install app dependencies
COPY ./build/webapp /ronak/nested/webapp
