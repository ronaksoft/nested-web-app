/**
 * Created by pouyan on 6/26/16.
 */
(function() {
  'use strict';
  angular
    .module('nested')
    .factory('NstFactoryError', NstFactoryError);

  /** @ngInject */
  function NstFactoryError(NstError) {
    function FactoryError(query, message, code, previous) {
      this.query = query;

      new NstError(message, code, previous);
    }

    FactoryError.prototype = NstError;

    /**
     * Retrieves the query which resulted into this error
     *
     * @returns {NstFactoryQuery}
     */
    FactoryError.prototype.getQuery = function () {
      return this.query;
    };

    return FactoryError;
  }
})();
