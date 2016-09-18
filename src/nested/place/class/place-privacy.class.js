(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPlacePrivacy', NstPlacePrivacy);

  /** @ngInject */
  function NstPlacePrivacy(NstModel) {
    /**
     * Creates an instance of NstPlacePrivacy.
     *
     * @constructor
     */
    function PlacePrivacy(data) {
      /**
       * Whether if place accepts email
       *
       * @type {undefined|Boolean}
       */
      this.email = undefined;

      /**
       * Whether if place is locked
       *
       * @type {undefined|Boolean}
       */
      this.locked = undefined;

      /**
       * Whether if place accepts posts from non-members
       *
       * @type {undefined|Boolean}
       */
      this.receptive = undefined;

      /**
       * Whether if place is searchable
       *
       * @type {undefined|Boolean}
       */
      this.search = undefined;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    PlacePrivacy.prototype = new NstModel();
    PlacePrivacy.prototype.constructor = PlacePrivacy;

    return PlacePrivacy;
  }
})();
