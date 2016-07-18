(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstTinyUser', NstTinyUser);

  function NstTinyUser(NST_OBJECT_EVENT, NstModel, NstStoreResource, NstPicture) {
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
       * User's Full Name
       *
       * @type {undefined|String}
       */
      this.fullName = undefined;

      /**
       * User's Picture
       *
       * @type {undefined|NstPicture}
       */
      this.picture = new NstPicture();

      NstModel.call(this);

      this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
        switch (event.detail.name) {
          case 'firstName':
          case 'lastName':
            this.setFullName(this.getFirstName() + ' ' + this.getLastName());
            break;
        }
      });

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

      if (picture instanceof NstPicture) {
        this.picture = picture;
      } else if (angular.isObject(picture)) {
        this.picture.org.setId(picture.org);
        var pictureClone = angular.copy(picture);
        delete pictureClone.org;

        for (var size in pictureClone) {
          this.picture.setThumbnail(size, new NstStoreResource(pictureClone[size]));
        }
      } else {
        return;
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
