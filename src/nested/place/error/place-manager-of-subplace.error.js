(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .factory('NstManagerOfSubPlaceError', NstManagerOfSubPlaceError);

  /** @ngInject */
  function NstManagerOfSubPlaceError(NstFactoryError) {
    /**
     * Creates an instance of NstManagerOfSubPlaceError
     *
     * @param {NstFactoryError}        previous  Previous error
     *
     * @constructor
     */
    function ManagerOfSubPlaceError(previous) {

      NstFactoryError.call(this, null, null, null, previous);
    }

    ManagerOfSubPlaceError.prototype = new NstFactoryError();
    ManagerOfSubPlaceError.prototype.constructor = ManagerOfSubPlaceError;

    return ManagerOfSubPlaceError;
  }
})();
