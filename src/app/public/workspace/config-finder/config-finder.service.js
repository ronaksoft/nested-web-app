(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcConfigFinder', NstSvcConfigFinder);

  /** @ngInject */
  function NstSvcConfigFinder($q, NstSvcServer) {

    function ConfigFinder() {
    }

    ConfigFinder.prototype.constructor = ConfigFinder;
    ConfigFinder.prototype.getConfig = getConfig;

    function getConfig(host) {
      var deferred = $q.defer();
      if (['web.nested.me', 'webapp.nested.me'].indexOf(host) > -1) {
        host = 'nested.me';
      }
      NstSvcServer.setDomain(host).then(function () {
        deferred.resolve(host);
      }).catch(function () {
        if (typeof host !== 'string') {
          deferred.reject();
          return
        }
        var parts = host.split('.');
        if (parts.length > 2) {
          parts = parts.reverse();
          var d = parts[1] + '.' + parts[0];
          if (d !== 'nested.me') {
            NstSvcServer.setDomain(d).then(function () {
              deferred.resolve(host);
            }).catch(function (reason) {
              deferred.reject(reason);
            });
          } else {
            deferred.reject();
          }
        } else {
          deferred.reject();
        }
      });
      return deferred.promise;
    }

    return new ConfigFinder();
  }
})();
