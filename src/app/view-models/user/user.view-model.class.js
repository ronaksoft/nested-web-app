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
    function VmUser(userModel, thumbnailSize) {

      this.id = '';
      this.name = '';
      this.avatar = '';

      if (userModel instanceof NstTinyUser || userModel instanceof NstUser) {
        this.id = userModel.getId();
        this.name = userModel.getFullName();
        if (userModel.hasPicture()) {
          var size = thumbnailSize || "x32";
          this.avatar = userModel.hasPicture() ? userModel.picture.getUrl(size) : '';
        }
      } else {
        throw Error("Could not create a NstVmUser from an unsupported type.");
      }
    }

    return VmUser;
  }
})();
