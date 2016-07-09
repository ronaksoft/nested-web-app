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

    return Model;
  }
})();
