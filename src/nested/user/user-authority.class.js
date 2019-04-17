(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstUserAuthority', NstUserAuthority);

  function NstUserAuthority() {
    /**
     * Creates an instance of UserAuthority.
     *
     * @constructor
     */
    function UserAuthority() {

      /**
       *  label editor
       *  @type {boolean}
       */
      this.labelEditor = undefined;
    }

    UserAuthority.prototype = {}
    UserAuthority.prototype.constructor = NstUserAuthority;

    return UserAuthority;
  }
})();
