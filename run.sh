#!/usr/bin/env bash

cd ./../webapp
echo "Directory changed to (`pwd`)"
node /bin/nested-reconfig.js
sleep 1
cd /bin

if [ -n "${NST_ADDR_PORT}" ]; then
    echo "";
else
    export NST_ADDR_PORT=80;
fi
if  [[ -n "${NST_TLS_KEY_FILE}" && -n "${NST_TLS_CERT_FILE}" ]] ; then
     if  [[ -f $NST_TLS_CERT_FILE && -f $NST_TLS_KEY_FILE ]]; then
        echo "Webapp started over SSL" ;
        envsubst < nginx-ssl.conf.template > /etc/nginx/nginx.conf;
     else
        echo "Webapp started without SSL" ;
        envsubst < nginx.conf.template > /etc/nginx/nginx.conf;
     fi ;
else
     echo "Webapp started without SSL" ;
     envsubst < nginx.conf.template > /etc/nginx/nginx.conf;
fi

export DOLLAR='$'


nginx -s stop
nginx
