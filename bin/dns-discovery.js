const dns = require('dns');
const http = require('http');

const CONFIG = {
  CACHE_PERIOD: 60000,
  RECORD_SEPARATOR: ';',
  SERVICE_INDEX: 0,
  PROTOCOL_INDEX: 1,
  PORT_INDEX: 2,
  HOST_INDEX: 3
};
let cache = {};

http.createServer(function (req, res) {
  const domainName = req.url.substr(1);

  if (cache[domainName] && Date.now() - cache[domainName].lastHit < CONFIG.CACHE_PERIOD) {
    res.writeHead(200, {'Content-Type': 'json/application'});
    res.end(cache[domainName].services);
    return;
  }

  console.log(`SERVICE DISCOVERY :: discovering ${domainName}`);

  dns.resolveTxt(`_nested.${domainName}`, (err, records) => {
    console.log(err, records)
    try {
      let services = JSON.stringify({
        data: parseTxt(records),
        status: 'ok'
      });
      console.log(services);
      cache[domainName] = {
        lastHit: Date.now(),
        services: services
      };

      console.log(`SERVICE DISCOVERY :: discovered ${services}`);

      res.writeHead(200, {'Content-Type': 'json/application'});
      res.end(services);
    } catch (error) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end(
        JSON.stringify({
          status: 'err',
          error: error
        })
      );
    }
  });
}).listen(5000);

console.log(`SERVICE DISCOVERY :: started at 5000`);

function parseTxt(txt) {

  let services = {};

  txt.forEach((records) => {
    records.forEach((record) => {
      const items = record.split(CONFIG.RECORD_SEPARATOR);

      items.forEach(recordItem => {

        const item = recordItem.split(':');
        if (item.length < 4) return;

        let service = item[CONFIG.SERVICE_INDEX];
        let protocol = item[CONFIG.PROTOCOL_INDEX];
        let port = item[CONFIG.PORT_INDEX];
        let host = item.splice(CONFIG.HOST_INDEX).join(':');

        if (!port) {
          if (protocol === 'wss' || protocol == 'https') {
            port = 443;
          } else {
            port = 80;
          }
        }

        let protocoleType = protocol.indexOf('ws') === 0 ? 'ws' : 'http';

        if (!services[service]) {
          services[service] = {};
        }

        if (!services[service][protocoleType]) {
          services[service][protocoleType] = [];
        }

        services[service][protocoleType].push(`${protocol}://${host}:${port}`)

      })
    });
  });

  return services;

}
