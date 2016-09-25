(function() {
  'use strict';
  angular
    .module('ronak.nested.web.common')
    .factory('NstFactoryError', NstFactoryError);

  /** @ngInject */
  function NstFactoryError(NstError) {
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
    function FactoryError(query, message, code, previous) {
      this.query = query;

      NstError.call(this, message, code, previous);
    }

    FactoryError.prototype = new NstError();
    FactoryError.prototype.constructor = FactoryError;

    return FactoryError;
  }
})();
