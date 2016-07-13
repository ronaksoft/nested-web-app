(function () {
  'use strict';

  angular
    .module('nested')
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
