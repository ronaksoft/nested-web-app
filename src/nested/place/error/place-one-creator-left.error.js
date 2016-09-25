(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .factory('NstPlaceOneCreatorLeftError', NstPlaceOneCreatorLeftError);

  /** @ngInject */
  function NstPlaceOneCreatorLeftError(NstFactoryError) {
    /**
     * Creates an instance of NstPlaceOneCreatorLeftError
     *
     * @param {NstFactoryError}        previous  Previous error
     *
     * @constructor
     */
    function PlaceOneCreatorLeftError(previous) {

      NstFactoryError.call(this, null, null, null, previous);
    }

    PlaceOneCreatorLeftError.prototype = new NstFactoryError();
    PlaceOneCreatorLeftError.prototype.constructor = PlaceOneCreatorLeftError;

    return PlaceOneCreatorLeftError;
  }
})();
