(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmInvitation', NstVmInvitation);

  function NstVmInvitation(NST_INVITATION_USER_ROLE, NstInvitation, NstVmUser) {
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
      this.place = null;
      this.inviter = null;
      this.invitee = null;
      this.state = null;

      if (invitationModel instanceof NstInvitation) {
        this.id = invitationModel.id;
        this.state = invitationModel.state;
        this.place = invitationModel.place;
        this.inviter = new NstVmUser(invitationModel.inviter);
        this.invitee = new NstVmUser(invitationModel.invitee);
        this.role = NST_INVITATION_USER_ROLE[invitationModel.role];
      } else {
        throw Error("Could not create a VmInvitation from an unsupported type.");
      }
    }

    return VmInvitation;
  }
})();
