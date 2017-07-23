FROM node:6-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g local-web-server
EXPOSE 80

COPY ./build/bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./build/bin/dns-discovery.js /bin/dns-discovery.js
CMD node /bin/dns-discovery.js & node /bin/nested-reconfig.js && \
    sleep 1 && \
    cd ./mobile \
    echo "Starting Mobile App" ; \
    node ./build/server.js && \
    cd ./../desktop \
    if [ -n "${NST_ADDR_PORT}" ]; then \
        echo ""; \
    else \
        export NST_ADDR_PORT=80; \
    fi && \
    if  [[ -n "${NST_TLS_KEY_FILE}" && -n "${NST_TLS_CERT_FILE}" ]] ; then \
         if  [[ -f $NST_TLS_CERT_FILE && -f $NST_TLS_KEY_FILE ]]; then \
            echo "Webapp started over SSL" ; \
            ws -p 80 -s redirect-to-safe-mode.html & \
            ws -p 443 --cert $NST_TLS_CERT_FILE --key $NST_TLS_KEY_FILE; \
         else \
            echo "Webapp started without SSL" ; \
            ws -p 80;\
         fi ;\
    else \
         echo "Webapp started without SSL" ; \
         ws -p 80;\
    fi \



# Install app dependencies
COPY ./build/desktop /usr/src/app/desktop
COPY ./build/mobile /usr/src/app/mobile
