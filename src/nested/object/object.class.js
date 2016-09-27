(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
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
          var uCamelCase = this.getJsName(k, true);
          this['set' + uCamelCase] = this['set' + uCamelCase] || (function (name) {
              return function (value) {
                this[name] = value;

                return this;
              };
            })(k);

          this['get' + uCamelCase] = this['get' + uCamelCase] || (function (name) {
              return function (value) {
                return this[name];
              };
            })(k);
        }
      }
    }

    MyObject.prototype = {};
    MyObject.prototype.constructor = MyObject;

    /**
     *
     * @param {String}  name
     * @param {Boolean} firstUpper
     */
    MyObject.prototype.getJsName = function(name, firstUpper) {
      var camelCased = name.split(/[_\-\s\.]/).map(function (v) {
        return (v[0] ? v[0].toUpperCase() + v.substr(1) : '');
      }).join('');

      return firstUpper ? camelCased : (camelCased[0].toLowerCase() + camelCased.substr(1));
    };

    MyObject.prototype.set = function (name, value) {
      var fnName = 'set' + this.getJsName(name, true);

      return this.hasOwnProperty(fnName) && angular.isFunction(this[fnName]) ? this[fnName](value) : undefined;
    };

    MyObject.prototype.get = function (name) {
      var fnName = 'get' + this.getJsName(name, true);

      return this.hasOwnProperty(fnName) && angular.isFunction(this[fnName]) ? this[fnName]() : undefined;
    };

    return MyObject;
  }
})();
