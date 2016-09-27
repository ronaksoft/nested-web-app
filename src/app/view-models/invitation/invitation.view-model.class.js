(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmInvitation', NstVmInvitation);

  function NstVmInvitation(NST_INVITATION_USER_ROLE, NstInvitation, NstVmPlace, NstVmUser) {
    /**
     * Creates an instance of NstVmInvitation
     *
     * @param {NstInvitation} invitationModel The Invitation Model
     *
     * @constructor
     */
    function VmInvitation(invitationModel) {
      this.id = '';
      this.role = '';
      this.place = new NstVmPlace();
      this.inviter = new NstVmUser();
      this.invitee = new NstVmUser();

      if (invitationModel instanceof NstInvitation) {
        this.id = invitationModel.getId();
        this.place = new NstVmPlace(invitationModel.getPlace());
        this.inviter = new NstVmUser(invitationModel.getInviter());
        this.invitee = new NstVmUser(invitationModel.getInvitee());
        this.role = NST_INVITATION_USER_ROLE[invitationModel.getRole()];
      }
    }

    return VmInvitation;
  }
})();
