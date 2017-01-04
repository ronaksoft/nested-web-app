(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstTinyUser', NstTinyUser);

  function NstTinyUser(NST_OBJECT_EVENT, NstModel) {
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

    TinyUser.prototype.hasPicture = function () {
      return this.picture && this.picture.original;
    }

    return TinyUser;
  }
})();
