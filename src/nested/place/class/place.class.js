(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPlace', NstPlace);

  /** @ngInject */
  function NstPlace(NST_OBJECT_EVENT, NstTinyPlace, NstPlacePrivacy, NstPlacePolicy, NstPicture) {
    /**
     * Creates an instance of NstPlace. Do not use this directly, use NstSvcPlaceFactory.get(data) instead
     *
     * @param {string|Object} data    Place Info
     *
     * @constructor
     */
    function Place(data) {
      /**
       * Place's description
       *
       * @type {undefined|String}
       */
      this.description = undefined;


      /**
       * Place's privacy
       *
       * @type {NstPlacePrivacy}
       */
      this.privacy = new NstPlacePrivacy();

      /**
       * Picture's policy
       *
       * @type {NstPicture}
       */
      this.picture = new NstPicture();


      /**
       * Place's policy
       *
       * @type {NstPlacePolicy}
       */
      this.policy = new NstPlacePolicy();

      /**
       * Place's users
       *
       * @type {{ userId: { role: String, user: NstUser }, length: Number }}
       */
      this.users = {
        length: 0
      };

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

      this.counters = {};

      NstTinyPlace.call(this, data);

      if (data) {
        this.fill(data);
      }
    }

    Place.prototype = new NstTinyPlace();
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

    Place.prototype.setPolicy = function (data) {
      for (var k in data) {
        this.policy.set(k, data[k]);
      }
      return this;
    };

    Place.prototype.getTeammatesCount = function () {
      if (!this.counters) {
        return 0;
      }

      return this.counters.key_holders + this.counters.creators;
    }

    return Place;
  }
})();
