(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMemberItem', NstVmMemberItem);

  function NstVmMemberItem(NstUser, NstTinyUser) {
    function VmMemberItem(model, role) {
      this.id = null;
      this.fullName = null;
      this.picture = null;
      this.hasPicture = null;
      this.role = role;

      if (model instanceof NstUser || model instanceof NstTinyUser) {

        this.id = model.id;
        this.fullName = model.getFullName();
        this.picture = model.picture;
        this.hasPicture = model.hasPicture;
      }


    }

    return VmMemberItem;
  }
})();
