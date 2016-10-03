(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstBaseFactory', NstBaseFactory);

  function NstBaseFactory(NstObservableObject) {
    function BaseFactory() {
      this.requests = [];
    }

    BaseFactory.prototype = new NstObservableObject();

    BaseFactory.prototype.constructor = BaseFactory;

    BaseFactory.prototype.sentinel = {
      watch : watch
    };

    function hold(name, id, callback) {
      if (!BaseFactory.requests[name]) {
        BaseFactory.requests[name] = {};
      }

      if (BaseFactory.requests[name][id]) {
        return BaseFactory.requests[name][id];
      }

      BaseFactory.requests[name][id] = callback.then(function (result) {
        release(name, id);

        return $q.resolve(result);
      }).catch(function (error) {
        release(name, id);

        return $q.reject(error);
      });
    }

    function release(name, id) {
      if (_.isObject(his.requests[name])) {
        if (!_.isUndefined(BaseFactory.requests[name][id])) {
          delete BaseFactory.requests[name][id];
        }
      }
    }

    function watch(id, callback) {
      if (!_.isFunction(callback)) {
        throw 'The provided callback is not a function';
      }

      return hold(callback.name, id, callback);
    }

    return BaseFactory;
  }
})();
