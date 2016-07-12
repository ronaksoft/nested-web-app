(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstModel', NstModel);

  /** @ngInject */
  function NstModel(NstObservableObject) {
    /**
     * Creates an instance of NstModel
     *
     * @constructor
     */
    function Model() {
      NstObservableObject.call(this);
    }

    Model.prototype = new NstObservableObject();
    Model.prototype.constructor = Model;

    Model.prototype.fill = function (data) {
      if (angular.isObject(data)) {
        for (var k in data) {
          this.set(k, data[k]);
        }
      }
    };

    Model.prototype.merge = function (data) {
      if (angular.isObject(data)) {
        for (var k in data) {
          var value = data[k];
          if (angular.isObject(value)) {
            value = angular.merge(this.get(k), value);
          } else if (angular.isArray(value)) {
            value = (this.get(k) || []).concat(value);
          }

          this.set(k, value);
        }
      }
    };

    return Model;
  }
})();
