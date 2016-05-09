(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreService', NestedStore);

  /** @ngInject */
  function NestedStore($window, WsService) {
    var storeService = {
      stores: {}
    };

    var stores = $window.sessionStorage.getItem('stores');
    if (stores) {
      storeService.stores = angular.fromJson(stores);
    }

    storeService.toUrl = function (uid, token) {
      var sid = uid.substr(0, 7);
      return this.getStoreUrl(sid).then(function (url) {
        return url + '/download/' + WsService.getSessionKey() + '/' + uid + (token ? ('/' + token) : '');
      });
    };

    storeService.getStoreUrl = function (sid) {
      if (!this.stores.hasOwnProperty(sid)) {
        return WsService.request('store/get_store_info', {
          store_id: sid
        }).then(function (data) {
          if (data.hasOwnProperty('store_info')) {
            this.stores[sid] = data.store_info;
            $window.sessionStorage.setItem('stores', angular.toJson(this.stores));

            return this.stores[sid].url;
          } else {
            return Promise.reject(data);
          }
        }.bind(this));
      }

      return new Promise(function (resolve) {
        resolve.call(this, this.stores[sid].url);
      }.bind(this));
    };

    storeService.update = function () {

    };

    return storeService;
  }

})();
