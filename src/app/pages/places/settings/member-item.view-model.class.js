(function () {
  'use strict';

  angular
    .module('nested')
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
        this.avatar = model.getPicture().getThumbnail(32).getUrl().view;
      } else if (model instanceof NstInvitation) {

        this.id = model.invitee.getId();
        this.name = model.invitee.getFullName();
        this.avatar = model.invitee.getPicture().getThumbnail(32).getUrl().view;
        this.InvitationId = model.id;
      }
    }

    return VmMemberItem;
  }
})();
