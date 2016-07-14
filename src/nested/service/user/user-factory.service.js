(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q, NstSvcTinyUserStorage, NstSvcUserStorage) {
    function UserFactory() {
      this.requests = {
        get: {},
        getTiny: {},
        remove: {}
      };
    }

    UserFactory.prototype = {};
    UserFactory.prototype.constructor = UserFactory;

    UserFactory.prototype.get = function (id) {

    };

    UserFactory.prototype.getTiny = function (id) {

    };

    UserFactory.prototype.set = function (user) {

    };

    UserFactory.prototype.remove = function (id) {

    };

    return new UserFactory();
  }
})();
