(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstTinyUser', NstTinyUser);

  function NstTinyUser(NstModel, NstStoreResource, NstPicture) {
    /**
     * Creates an instance of NstTinyUser. Do not use this directly, use NstSvcUserFactory.getTiny(data) instead
     *
     * @param {string|Object} data  User Info
     *
     * @constructor
     */
    function TinyUser(data) {
      /**
       * User Identifier (Username)
       *
       * @type {undefined|String}
       */
      this.id = undefined;

      /**
       * User's First Name
       *
       * @type {undefined|String}
       */
      this.firstName = undefined;

      /**
       * User's Last Name
       *
       * @type {undefined|String}
       */
      this.lastName = undefined;

      /**
       * User's Picture
       *
       * @type {undefined|NstPicture}
       */
      this.picture = new NstPicture();

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    TinyUser.prototype = new NstModel();
    TinyUser.prototype.constructor = TinyUser;

    TinyUser.prototype.setFname = function (fname) {
      return this.setFirstName(fname);
    };

    TinyUser.prototype.setLname = function (lname) {
      return this.setLastName(lname);
    };

    TinyUser.prototype.setPicture = function (picture) {
      var oldValue = this.picture;

      this.picture.org.setId(picture.org);
      var pictureClone = angular.copy(picture);
      delete pictureClone.org;

      for (var size in pictureClone) {
        this.picture.setThumbnail(size, new NstStoreResource(pictureClone[size]));
      }

      var event = new CustomEvent(NST_OBJECT_EVENT.CHANGE, {
        detail: {
          name: 'picture',
          newValue: this.picture,
          oldValue: oldValue,
          target: this
        }
      });
      this.dispatchEvent(event);
    };

    return TinyUser;
  }
})();
