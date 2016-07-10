(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstUser', NstUser);

  function NstUser(NstModel) {
    /**
     * Creates an instance of NstUser. Do not use this directly, use NstSvcUserFactory.get(data) instead
     *
     * @param {string|Object} data  User Info
     *
     * @constructor
     */
    function User(data) {
      /**
       * User Identifier (Username)
       *
       * @type {undefined|String}
       */
      this.id = undefined;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    User.prototype = new NstModel();
    User.prototype.constructor = User;

    return User;
  }
})();
