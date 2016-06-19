(function () {
  'use strict';

  angular
    .module('nested')
    .service('CacherFactoryService', CacherFactoryService);

  /** @ngInject */
  function CacherFactoryService($log, NestedCacher) {
    function Factory() {
      this.cachers = {};
      this.listeners = {};
    }

    Factory.prototype = {
      create: function (id, storage) {
        if (!this.cachers.hasOwnProperty(id)) {
          this.cachers[id] = new NestedCacher(id, storage);
        }

        return this.get(id);
      },

      get: function (id) {
        return this.cachers[id];
      }

    };

    return new Factory();
  }

})();
