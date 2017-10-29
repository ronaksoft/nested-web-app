#!/usr/bin/env bash

echo "Starting Web Servers "
node /bin/dns-discovery.js &

cd mobile
echo "Directory changed to (`pwd`)"
echo "Starting Mobile App"
node ./build/server.js &

cd ./../desktop
echo "Directory changed to (`pwd`)"
node /bin/nested-reconfig.js
sleep 1
if [ -n "${NST_ADDR_PORT}" ]; then
    echo "";
else
    export NST_ADDR_PORT=80;
fi
if  [[ -n "${NST_TLS_KEY_FILE}" && -n "${NST_TLS_CERT_FILE}" ]] ; then
     if  [[ -f $NST_TLS_CERT_FILE && -f $NST_TLS_KEY_FILE ]]; then
        echo "Webapp started over SSL" ;
        ws -p 80 -s redirect-to-safe-mode.html -c lws.config.js  -v &
        ws -p 443 --cert $NST_TLS_CERT_FILE --key $NST_TLS_KEY_FILE -c lws.config.js -v --ciphers="ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK" --secure-protocol=TLSv1_2_method;
     else
        echo "Webapp started without SSL" ;
        ws -p 80 -c lws.config.js -v;
     fi ;
else
     echo "Webapp started without SSL" ;
     ws -p 80 -c lws.config.js -v;
fi
