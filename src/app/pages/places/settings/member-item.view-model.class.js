(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMemberItem', NstVmMemberItem);

  function NstVmMemberItem(NstUser, NstTinyUser, NstInvitation) {
    /**
     * Creates an instance of NstVmMemberItem
     *
     * @param {NstTinyUser|NstUser} model The MemberItem Model
     *
     * @constructor
     */
    function VmMemberItem(model, role) {
      this.id = null;
      this.name = null;
      this.avatar = null;
      this.role = null;
      this.InvitationId = null;

      this.isPending = function () {
        return !!this.InvitationId;
      }

      if (role) {
        this.role = role;
      }

      if (model instanceof NstUser || model instanceof NstTinyUser) {

        this.id = model.getId();
        this.name = model.getFullName();
        if (model.hasPicture()) {
          this.avatar = model.picture.getUrl("x64");
        }
      } else if (model instanceof NstInvitation) {

        this.id = model.invitee.getId();
        this.name = model.invitee.getFullName();
        this.InvitationId = model.id;

        if (model.invitee.hasPicture()) {
          this.avatar = model.invitee.picture.getUrl("x64");
        }
      }
    }

    return VmMemberItem;
  }
})();
