(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstFactoryEventData', NstFactoryEventData);

  /** @ngInject */
  function NstFactoryEventData() {
    /**
     * Creates an instance of FactoryEventData
     *
     * @constructor
     */
    function FactoryEventData(object) {
      if (!object) {
        throw new Error('Could not find object.');
      }
      this.detail = object;
    }

    FactoryEventData.prototype = {};
    FactoryEventData.prototype.constructor = FactoryEventData;

    return FactoryEventData;
  }
})();
