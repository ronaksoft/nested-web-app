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
        ws -p 443 --cert $NST_TLS_CERT_FILE --key $NST_TLS_KEY_FILE -c lws.config.js -v --ciphers="ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM" --secure-protocol=TLSv1_2_method;
     else
        echo "Webapp started without SSL" ;
        ws -p 80 -c lws.config.js -v;
     fi ;
else
     echo "Webapp started without SSL" ;
     ws -p 80 -c lws.config.js -v;
fi
