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
  function NstPlace(NST_OBJECT_EVENT, NstModel, NstPlacePrivacy) {
    /**
     * Creates an instance of NstPlace. Do not use this directly, use NstSvcPlaceFactory.get(data) instead
     *
     * @param {string|Object} data    Place Info
     *
     * @constructor
     */
    function Place(data) {
      /**
       * Place Identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;

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

      /*****************************
       *****      Ancestors     ****
       *****************************/

      /**
       * Place's parent
       *
       * @type {undefined|NstPlace}
       */
      this.parent = undefined;

      /**
       * Place's grand place
       *
       * @type {undefined|NstPlace}
       */
      this.grandParent = undefined;

      /*****************************
       *****      Descendant    ****
       *****************************/

      /**
       * Place's children
       *
       * @type {{ placeId: NstPlace, length: Number }}
       */
      this.children = {
        length: 0
      };

      /**
       * Place's Picture
       *
       * @type {undefined|NstPicture}
       */
      this.picture = undefined;

      /**
       * Place's users
       *
       * @type {{ userId: { role: String, user: NstUser }, length: Number }}
       */
      this.users = {
        length: 0
      };

      /**
       * Place's privacy
       *
       * @type {NstPlacePrivacy}
       */
      this.privacy = new NstPlacePrivacy();

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    Place.prototype = new NstModel();
    Place.prototype.constructor = Place;

    /**
     * Return users filtered by desired roles
     *
     * @param {NST_PLACE_MEMBER_TYPE|NST_PLACE_MEMBER_TYPE[]} roles Roles
     *
     * @returns {{ userId: { role: String, user: NstUser }, length: Number }}
     */
    Place.prototype.getUsersByRole = function (roles) {
      roles = angular.isArray(roles) ? roles : [roles];
      var result = {
        length: 0
      };

      for (var id in this.users) {
        if (roles.indexOf(this.users[id].role) > 0) {
          result[id] = this.users[id];
          result.length++;
        }
      }

      return result;
    };

    Place.prototype.setPrivacy = function (data) {
      var oldValue = this.privacy;
      for (var k in data) {
        this.privacy.set(k, data[k]);
      }

      var event = new CustomEvent(NST_OBJECT_EVENT.CHANGE, {
        detail: {
          name: 'privacy',
          newValue: this.privacy,
          oldValue: oldValue,
          target: this
        }
      });
      this.dispatchEvent(event);

      return this;
    };

    return Place;
  }
})();
