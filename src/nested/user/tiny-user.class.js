(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstTinyUser', NstTinyUser);

  function NstTinyUser() {
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
      this.picture = undefined;

      if (data) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.fullName = _.isFunction(data, "getFullName")
          ? data.data.getFullName()
          : this.firstName + " " + this.lastName;
        this.picture = data.picture;
      }
    }

    TinyUser.prototype = {};
    TinyUser.prototype.constructor = TinyUser;

    TinyUser.prototype.hasPicture = function () {
      return this.picture && this.picture.preview;
    }

    TinyUser.prototype.getFullName = function () {
      return this.firstName + " " + this.lastName;
    }

    return TinyUser;
  }
})();
