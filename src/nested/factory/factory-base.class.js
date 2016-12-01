(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstBaseFactory', NstBaseFactory);

  function NstBaseFactory(NstObservableObject, $q, NstSvcLogger) {
    function BaseFactory() {


      var self = this;
      var requests = {};

      self.hold = function(key, callback) {
        if (requests[key]) {
          return requests[key];
        }

        requests[key] = $q(function(resolve, reject) {
          callback().then(resolve).catch(reject).finally(function() {
            self.release(key);
          });
        });

        return requests[key];
      };

      self.release = function(key) {
        if (_.isObject(requests[key])) {
          if (!_.isUndefined(requests[key])) {
            delete requests[key];
          }
        }
      }

      self.watch = function(callback, name, id) {
        if (!_.isFunction(callback)) {
          throw 'The provided callback is not a function';
        }

        var key = generateRequestKey(name, id);

        return self.hold(key, callback);
      }

      this.sentinel = {
        watch: self.watch
      }

    }

    BaseFactory.prototype = new NstObservableObject();

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
