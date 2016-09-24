(function() {
  'use strict';
  angular
    .module('nested')
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
