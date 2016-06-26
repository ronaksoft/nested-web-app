/**
 * Created by pouyan on 6/26/16.
 */
(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstError', NstError);

  /** @ngInject */
  function NstError() {
    /**
     * Creates an instance of NstError
     *
     * @param {string}      message Error message
     * @param {int}         code    Error code
     * @param {NstError} previous   Previous error
     *
     * @constructor
     */
    function Error(message, code, previous) {
      this.message = message;
      this.code = code;
      this.previous = previous;
    }

    Error.prototype = {
      getMessage: function () {
        return this.message;
      },

      getCode: function () {
        return this.code;
      },

      getPrevious: function () {
        return this.previous;
      }
    };

    return Error;
  }
})();
