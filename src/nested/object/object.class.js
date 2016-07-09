(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstObject', NstObject);

  /** @ngInject */
  function NstObject() {
    /**
     * Creates an instance of NstObject
     *
     * @constructor
     */
    function MyObject() {
      for (var k in this) {
        if (!(this[k] instanceof Function)) {
          var camelCase = k.split(/[_\-\s\.]/).map(function (v) { return v[0].toUpperCase() + v.substr(1); }).join('');
          this['set' + camelCase] = this['set' + camelCase] || new (function (obj, name) {
            return function (value) {
              obj[name] = value;

              return obj;
            };
          })(this, k);

          this['get' + camelCase] = this['get' + camelCase] || new (function (obj, name) {
            return function () {
              return obj[name];
            };
          })(this, k);
        }
      }
    }

    MyObject.prototype = {};

    return MyObject;
  }
})();
