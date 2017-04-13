(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMemberItem', NstVmMemberItem);

  function NstVmMemberItem(NstUser, NstTinyUser, NstInvitation) {
    function VmMemberItem(model, role) {
      this.id = null;
      this.fullName = null;
      this.picture = null;
      this.hasPicture = null;
      this.role = role;
      this.InvitationId = null;

      if (model instanceof NstUser || model instanceof NstTinyUser) {

        this.id = model.id;
        this.fullName = model.getFullName();
        this.picture = model.picture;
        this.hasPicture = model.hasPicture;
      } else if (model instanceof NstInvitation) {

        this.InvitationId = model.id;
        this.id = model.invitee.id;
        this.fullName = model.invitee.getFullName();
        this.picture = model.invitee.picture;
        this.hasPicture = model.invitee.hasPicture;
      }

      this.isPending = function () {
        return !!this.InvitationId;
      }

    }

    return VmMemberItem;
  }
})();
