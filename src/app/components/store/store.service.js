(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreService', NestedStore);

  /** @ngInject */
  function NestedStore(AuthService) {
    var storeService = {
    };

    storeService.toUrl = function (uid) {
      return 'http://' + uid.substr(0, 7) + '.stores.nested.me/download/' + AuthService.getSessionKey() + '/' + uid;
    };

    return storeService;
  }

})();
