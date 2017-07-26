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
        ws -p 80 -s redirect-to-safe-mode.html -c ./.local-web-server.json &
        ws -p 443 --cert $NST_TLS_CERT_FILE --key $NST_TLS_KEY_FILE -c ./.local-web-server.json;
     else
        echo "Webapp started without SSL" ;
        ws -p 80 -c ./.local-web-server.json;
     fi ;
else
     echo "Webapp started without SSL" ;
     ws -p 80 -c ./.local-web-server.json;
fi
