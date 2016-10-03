(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPlacePolicy', NstPlacePolicy);

  /** @ngInject */
  function NstPlacePolicy(NstModel, NST_PLACE_POLICY) {
    /**
     * Creates an instance of NstPlacePolicy.
     *
     * @constructor
     */
    function PlacePolicy(data) {

      /**
       * Who can add sub place to a grand place
       *
       * @type {'everyone' | 'creators'}
       */
      this.add_place = NST_PLACE_POLICY.CREATORS;

      /**
       * Who can add member to place
       *
       * @type {'everyone' | 'creators'}
       */
      this.add_member = NST_PLACE_POLICY.CREATOR;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    PlacePolicy.prototype = new NstModel();
    PlacePolicy.prototype.constructor = PlacePolicy;

    return PlacePolicy;
  }
})();
