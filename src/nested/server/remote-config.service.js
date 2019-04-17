(function () {
  'use strict';

  angular
    .module('ronak.nested.web.data')
    .service('NstSvcRemoteConfig', NstSvcRemoteConfig);

  /** @ngInject */
  function NstSvcRemoteConfig(_, $q, $rootScope, NST_CONFIG, NstHttp) {

    var NST_SERVER_DOMAIN = 'nested.server.domain';

    function RemoteConfig() {
    }

    RemoteConfig.prototype.parseConfigFromRemote = function (data) {
      var cyrus = [];
      var xerxes = [];
      var admin = [];
      _.forEach(data, function (configs) {
        var config = configs.split(';');
        _.forEach(config, function (item) {
          if (_.startsWith(item, 'cyrus:')) {
            cyrus.push(item);
          } else if (_.startsWith(item, 'xerxes:')) {
            xerxes.push(item);
          }
          if (_.startsWith(item, 'admin:')) {
            admin.push(item);
          }
        });
      });
      var cyrusHttpUrl = '';
      var cyrusWsUrl = '';
      var config = {};
      _.forEach(cyrus, function (item) {
        config = parseConfigData(item);
        if (config.protocol === 'http' || config.protocol === 'https') {
          cyrusHttpUrl = getCompleteUrl(config);
        } else if (config.protocol === 'ws' || config.protocol === 'wss') {
          cyrusWsUrl = getCompleteUrl(config);
        }
      });
      return {
        websocket: cyrusWsUrl + '/api',
        register: cyrusHttpUrl  + '/api',
        store: cyrusHttpUrl + '/file'
      }
    };

    function parseConfigData(data) {
      var items = data.split(':');
      return {
        name: items[0],
        protocol: items[1],
        port: items[2],
        url: items[3]
      };
    }

    function getCompleteUrl(config) {
      return config.protocol + '://' + config.url + ':' + config.port;
    }

    RemoteConfig.prototype.constructor = RemoteConfig;

    function loadConfigFromRemote(domainName, planB) {
      NST_CONFIG.DOMAIN = domainName;
      var ajax;
      if (planB) {
        ajax = new NstHttp(location.protocol + "//" + location.host + '/getConfig/' + domainName);
      } else {
        ajax = new NstHttp('https://npc.nested.me/dns/discover/' + domainName);
      }
      return ajax.get();
    }

    function setConfig(config, domain) {
      var configs = remoteConfig.parseConfigFromRemote(config);
      NST_CONFIG.WEBSOCKET.URL = configs.websocket;
      NST_CONFIG.REGISTER.AJAX.URL = configs.register;
      NST_CONFIG.STORE.URL = configs.store;
      NST_CONFIG.DOMAIN = domain;
      localStorage.setItem(NST_SERVER_DOMAIN, domain);
    }

    RemoteConfig.prototype.setDomain = function (domain) {
      var deferred = $q.defer();
      loadConfigFromRemote(domain)
        .then(function (remoteConfig) {
          setConfig(remoteConfig, domain);
          deferred.resolve();
        })
        .catch(function () {
          loadConfigFromRemote(domain, true)
            .then(function (remoteConfig) {
              setConfig(remoteConfig, domain);
              deferred.resolve();
            }).catch(function () {
            deferred.reject();
          });
        });
      return deferred.promise;
    };

    var remoteConfig = new RemoteConfig();
    return remoteConfig;
  }
})
();
