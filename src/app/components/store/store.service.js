(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreService', NestedStore);

  /** @ngInject */
  function NestedStore($cookies) {
    var storeService = {
    };

    storeService.toUrl = function (uid) {
      return 'http://' + uid.substr(0, 7) + '.stores.nested.me/download/' + $cookies.get('nsk') + '/' + uid;
    };

    return storeService;
  }

})();
