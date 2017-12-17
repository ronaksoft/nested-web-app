(function () {
  'use strict';
  angular
    .module('ronak.nested.web')
    .service('NstSvcSystemConstants', NstSvcSystemConstants);

  /** @ngInject */
  function NstSvcSystemConstants($q, _, NstSvcServer, NstBaseFactory, NstSvcLogger) {


    function SystemConstants() {
      this.limits = {};
      this.loaded = false;
    }

    SystemConstants.prototype = new NstBaseFactory();
    SystemConstants.prototype.constructor = SystemConstants;

    SystemConstants.prototype.get = function () {
      var deferred = $q.defer();
      var that = this;

      if (that.loaded) {
        deferred.resolve(that.limits);
      } else {
        NstSvcServer.request('system/get_int_constants', {}).then(function (result) {
          that.limits = result;
          deferred.resolve(that.limits);
        }).catch(function (error) {
          NstSvcLogger.error('Could not retrieve system limits!', error);
          deferred.reject(error);
        }).finally(function () {
          that.loaded = true;
        });
      }


      return deferred.promise;
    }

    return new SystemConstants();
  }
})();
