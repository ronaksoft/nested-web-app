(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_PLACE_ACCESS', {
      READ: 'RD',
      WRITE: 'WR',
      READ_POST: 'RD',
      WRITE_POST: 'WR',
      REMOVE_POST: 'D',
      CONTROL: 'C',
      ADD_MEMBERS: 'AM',
      REMOVE_MEMBERS: 'RM',
      SEE_MEMBERS: 'SM',
      REMOVE_PLACE: 'RP',
      ADD_PLACE: 'AP',
      GUEST: 'G'
    })
    .constant('NST_PLACE_MEMBER_TYPE', {
      KEY_HOLDER: 'key_holder',
      KNOWN_GUEST: 'known_guest',
      CREATOR: 'creator'
    })
    .factory('NstPlace', NstPlace);

  /** @ngInject */
  function NstPlace(NstModel) {
    /**
     * Creates an instance of NstPlace. Do not use this directly, use NstSvcPlaceFactory.get(data) instead
     *
     * @param {string|Object} data    Place Info
     * @param {NstPlace}      parent  Place's parent
     *
     * @constructor
     */
    function Place(data, parent) {
      /**
       * Place Identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;

      /**
       * Place's parent
       *
       * @type {NstPlace}
       */
      this.parent = undefined;

      /**
       * Place's grand place
       *
       * @type {undefined|NstPlace}
       */
      this.grandParent = undefined;

      /**
       * Place's name
       *
       * @type {undefined|String}
       */
      this.name = undefined;

      /**
       * Place's description
       *
       * @type {undefined|String}
       */
      this.description = undefined;

      /**
       * Place's children
       *
       * @type {NstPlace[]}
       */
      this.children = [];

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    Place.prototype = new NstModel();
    Place.prototype.constructor = Place;

    return Place;
  }
})();
