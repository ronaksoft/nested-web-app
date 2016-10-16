(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstBaseFactory', NstBaseFactory);

  function NstBaseFactory(NstObservableObject, $q) {
    function BaseFactory() {
      BaseFactory.requests = {};
    }

    BaseFactory.prototype = new NstObservableObject();

    BaseFactory.prototype.constructor = BaseFactory;

    BaseFactory.prototype.sentinel = {
      watch : watch
    };

    function hold(key, callback) {
      if (BaseFactory.requests[key]) {
        return BaseFactory.requests[key];
      }

      BaseFactory.requests[key] = $q(function (resolve, reject) {
        callback().then(resolve).catch(reject).finally(function () {
          console.log('key',key);
          release(key);
        });
      });

      return BaseFactory.requests[key];
    }

    function release(key) {
      if (_.isObject(BaseFactory.requests[key])) {
        if (!_.isUndefined(BaseFactory.requests[key])) {
          delete BaseFactory.requests[key];
        }
      }
    }

    function watch(callback, name, id) {
      if (!_.isFunction(callback)) {
        throw 'The provided callback is not a function';
      }

      var key = generateRequestKey(name, id);

      return hold(key, callback);
    }

    return BaseFactory;
  }

  function generateRequestKey(name, id) {
    var key = name;
    if (id) {
      key = key + "-" + id;
    }

    return key;
  }
})();
