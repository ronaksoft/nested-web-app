(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstLocalStorage', NstLocalStorage);

  /** @ngInject */
  function NstLocalStorage($window, $log, storageKeySeparator) {
    function LocalStorage(name) {
      if (!name) {
        throw 'A LocalStorage must have a unique name.';
      }
      this.name = name;
      this.separator = storageKeySeparator || '.';
    }

    LocalStorage.prototype.constructor = LocalStorage;

    LocalStorage.prototype.set = set;
    LocalStorage.prototype.get = get;
    LocalStorage.prototype.remove = remove;

    function set(key, value, serializer) {
      var transform = serializer || serialize;
      $window.localStorage.setItem(this.name + this.separator + key, transform(value));

      return value;
    }

    function get(key, deserializer) {
      var transform = deserializer || deserialize;

      return transform($window.localStorage.getItem(this.name + this.separator + key));
    }

    function remove(key) {
      $window.localStorage.removeItem(this.name + this.separator + key);
    }

    function serialize(obj) {
      return JSON.stringify(obj);
    }

    function deserialize() {
      var obj = null;
      try {
        obj = JSON.parse(content);
      } catch (error) {
        if (error instanceof SyntaxError) {
          $log.debug('An error occured in parsing JSON', error);
        }
      }
      return obj;
    }

    return LocalStorage;
  }
})();
