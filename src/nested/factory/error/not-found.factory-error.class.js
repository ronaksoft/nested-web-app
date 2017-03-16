(function() {
  'use strict';
  angular
    .module('ronak.nested.web.common')
    .factory('NstFactoryErrorNotFound', NstFactoryErrorNotFound);

  /** @ngInject */
  function NstFactoryErrorNotFound(NstError) {
    /**
     * Creates an instance of NstFactoryError
     *
     * @param {NstFactoryQuery} query     The query resulted into error
     * @param {string}          message   Error message
     * @param {int}             code      Error code
     * @param {NstError}        previous  Previous error
     *
     * @constructor
     */
    function FactoryErrorNotFound(query, message, code, previous) {
      this.query = query;

      NstError.call(this, message, code, previous);
    }

    FactoryErrorNotFound.prototype = new NstError();
    FactoryErrorNotFound.prototype.constructor = FactoryErrorNotFound;

    return FactoryErrorNotFound;
  }
})();
