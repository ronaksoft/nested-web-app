(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .factory('NstServerError', NstServerError);

  /** @ngInject */
  function NstServerError(NstError) {
    /**
     * Creates an instance of NstServerError
     *
     * @param {NstServerQuery}  query     The query resulted into error
     * @param {string}          message   Error message
     * @param {int}             code      Error code
     * @param {NstError}        previous  Previous error
     *
     * @constructor
     */
    function ServerError(query, message, code, previous) {
      this.query = query;

      NstError.call(this, message, code, previous);
    }

    ServerError.prototype = new NstError();
    ServerError.prototype.constructor = ServerError;

    return ServerError;
  }
})();
