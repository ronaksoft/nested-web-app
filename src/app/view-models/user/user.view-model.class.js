(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmUser', NstVmUser);

  function NstVmUser(NstTinyUser, NstUser) {
    /**
     * Creates an instance of NstVmUser
     *
     * @param {NstTinyUser|NstUser} userModel The User Model
     *
     * @constructor
     */
    function VmUser(userModel) {
      this.id = '';
      this.name = '';
      this.avatar = '';

      if (userModel instanceof NstTinyUser || userModel instanceof NstUser) {
        this.id = userModel.getId();
        this.name = userModel.getFullName();
        this.avatar = userModel.picture.id ? userModel.picture.thumbnails.x32.url.view : '/assets/icons/absents_place.svg';
      }
    }

    return VmUser;
  }
})();
