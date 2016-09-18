(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .factory('NstPlaceCreatorOfParentError', NstPlaceCreatorOfParentError);
  // @NOTE : Imagine place A that has place B inside. You can not remove a user
  //         from place B until is creator of the top-level place (A). The user
  //         shoud be removed from the most-top level place and it will be removed
  //         from its child places automatically.

  /** @ngInject */
  function NstPlaceCreatorOfParentError(NstFactoryError) {
    /**
     * Creates an instance of NstPlaceCreatorOfParentError
     *
     * @param {NstFactoryError}        previous  Previous error
     *
     * @constructor
     */
    function PlaceCreatorOfParentError(previous) {

      NstFactoryError.call(this, null, null, previous);
    }

    PlaceCreatorOfParentError.prototype = new NstFactoryError();
    PlaceCreatorOfParentError.prototype.constructor = PlaceCreatorOfParentError;

    return PlaceCreatorOfParentError;
  }
})();
