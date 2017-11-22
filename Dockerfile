FROM node:8.2.1-alpine

# Create app directory
RUN adduser -D -u 1000 -g 'nginx' nginx
RUN mkdir -p /ronak/nested
RUN chown -R nginx:nginx /ronak/nested
WORKDIR /ronak/nested
RUN apk update
RUN apk add ca-certificates
RUN apk add gettext
RUN apk add nginx
RUN apk add openrc --no-cache
RUN chown -R nginx:nginx /var/lib/nginx
EXPOSE 80
EXPOSE 443

COPY ./bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./bin/nginx.conf.template /bin/nginx.conf.template
COPY ./bin/nginx-ssl.conf.template /bin/nginx-ssl.conf.template
COPY ./run.sh .
CMD  /bin/sh run.sh

# Install app dependencies
COPY ./build/webapp /ronak/nested/webapp
