(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstModel', NstModel);

  /** @ngInject */
  function NstModel(NST_OBJECT_EVENT, NstObservableObject) {
    /**
     * Creates an instance of NstModel
     *
     * @constructor
     */
    function Model() {
      /**
       * Whether if model is new
       *
       * @type {boolean}
       */
      this.new = true;

      /**
       * Whether if model is updated
       *
       * @type {boolean}
       */
      this.updated = false;

      NstObservableObject.call(this);

      this.addEventListener(NST_OBJECT_EVENT.CHANGE, function () {
        this.updated = true;
      });
    }

    Model.prototype = new NstObservableObject();
    Model.prototype.constructor = Model;

    Model.prototype.fill = function (data) {
      if (angular.isObject(data)) {
        for (var k in data) {
          this.set(k, data[k]);
        }
      }

      return this;
    };

    Model.prototype.merge = function (data) {
      if (angular.isObject(data)) {
        for (var k in data) {
          var value = data[k];
          if (angular.isObject(value)) {
            value = angular.extend(this.get(k) || {}, value);
          } else if (angular.isArray(value)) {
            value = (this.get(k) || []).concat(value);
          }

          this.set(k, value);
        }
      }

      return this;
    };

    Model.prototype.isNew = function () {
      return this.getNew();
    };

    Model.prototype.isUpdated = function () {
      return this.getUpdated();
    };

    Model.prototype.save = function () {
      this.new = false;
      this.updated = false;

      return this;
    };

    return Model;
  }
})();
