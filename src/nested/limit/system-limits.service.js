(function () {
  'use strict';
  angular
    .module('ronak.nested.web')
    .service('NstSvcSystem', NstSvcSystem);

  /** @ngInject */
  function NstSvcSystem($q, _, NstSvcServer, NstBaseFactory, NstSvcLogger) {


    function System() {
      this.limits = {};
      this.loaded = false;
      this.license = null;
    }

    System.prototype = new NstBaseFactory();
    System.prototype.constructor = System;

    System.prototype.getConstants = function () {
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

    System.prototype.getLicense = function () {
      var deferred = $q.defer();
      var that = this;

      if (that.license) {
        deferred.resolve(that.license);
      } else {
        NstSvcServer.request('system/get_license', {}).then(function (result) {
          that.license = result.license;
          deferred.resolve(that.license);
        }).catch(function (error) {
          NstSvcLogger.error('Could not retrieve system license!', error);
          deferred.reject(error);
        }).finally(function () {
          that.license = null;
        });
      }


      return deferred.promise;
    }

    return new System();
  }
})();
