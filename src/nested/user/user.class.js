(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstUser', NstUser);

  function NstUser(NstTinyUser) {
    /**
     * Creates an instance of NstUser. Do not use this directly, use NstSvcUserFactory.get(data) instead
     *
     * @param {string|Object} data  User Info
     *
     * @constructor
     */
    function User(data) {
      /**
       * User's Email Address
       *
       * @type {undefined|String}
       */
      this.email = undefined;

      /**
       * User's Email Address Verification Status
       *
       * @type {undefined|String}
       */
      this.emailVerified = undefined;

      /**
       * User's Phone Number
       *
       * @type {undefined|String}
       */
      this.phone = undefined;

      /**
       * User's Country
       *
       * @type {undefined|String}
       */
      this.country = undefined;

      /**
       * User's Registration Status
       *
       * @type {undefined|Boolean}
       */
      this.registered = undefined;

      /**
       * User's Date of Birth
       *
       * @type {undefined|string}
       */
      this.dateOfBirth = undefined;

      /**
       *  User's Gender
       *  @type {undefined|m|f|o}
       */
      this.gender = undefined;


      /**
       * Number of times the user was mentioned
       * @type {undefined|Number}
       */
      this.totalMentionsCount = undefined;


      /**
       * Number of unread mentions
       * @type {undefined|Number}
       */
      this.unreadMentionsCount = undefined;

      NstTinyUser.call(this);

      if (data) {
        this.fill(data);
      }
    }

    User.prototype = new NstTinyUser();
    User.prototype.constructor = User;

    return User;
  }
})();
