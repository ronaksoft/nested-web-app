(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSessionStorage', NstSessionStorage);

  /** @ngInject */
  function NstSessionStorage($window, $log, storageKeySeparator){
    function SessionStorage(name) {
      if (!name) {
        throw 'A SessionStorage must have a unique name.';
      }
      this.name = name;
      this.separator = storageKeySeparator || '.';
    }

    SessionStorage.prototype.constructor = SessionStorage;

    SessionStorage.prototype.set = set;
    SessionStorage.prototype.get = get;
    SessionStorage.prototype.remove = remove;


    function set(key, value, serializer) {
      var transform = serializer || serialize;
      $window.sessionStorage.setItem(this.name + this.separator + key, transform(value));

      return value;
    }

    function get(key, deserializer) {
      var transform = deserializer || deserialize;

      return transform($window.sessionStorage.getItem(this.name + this.separator + key));
    }

    function remove(key) {
      $window.sessionStorage.removeItem(this.name + this.separator + key);
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

    return SessionStorage;
  }
})();
