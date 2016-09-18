(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstError', NstError);

  /** @ngInject */
  function NstError(NstObject) {
    /**
     * Creates an instance of NstError
     *
     * @param {String}    message   Error message
     * @param {Number}    code      Error code
     * @param {NstError}  previous  Previous error
     *
     * @constructor
     */
    function Error(message, code, previous) {
      this.message = message;
      this.code = code;
      this.previous = previous;

      NstObject.call(this);
    }

    Error.prototype = new NstObject();
    Error.prototype.constructor = Error;

    return Error;
  }
})();
