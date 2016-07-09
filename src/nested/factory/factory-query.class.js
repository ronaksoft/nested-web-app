(function() {
  'use strict';
  angular
    .module('nested')
    .factory('NstFactoryQuery', NstFactoryQuery);

  /** @ngInject */
  function NstFactoryQuery(NstObject) {
    function FactoryQuery(id, data) {
      this.id = id;
      this.data = data;

      NstObject.call(this);
    }

    FactoryQuery.prototype = new NstObject();
    FactoryQuery.prototype.constructor = FactoryQuery;

    return FactoryQuery;
  }
})();
