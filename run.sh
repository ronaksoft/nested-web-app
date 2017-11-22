#!/usr/bin/env bash

cd /ronak/nested/webapp
echo "Directory changed to (`pwd`)"
node /bin/nested-reconfig.js script=scripts tmp=nestedConfig
node /bin/nested-reconfig.js script=m/js tmp=nestedConfigMobile
node /bin/nested-reconfig.js script=admin tmp=nestedConfigAdmin
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

export DOLLAR='$';

rc-service nginx start;
