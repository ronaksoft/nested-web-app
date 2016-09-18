(function() {
  'use strict';

  angular.module('ronak.nested.web.user').factory('NstInvitation', NstInvitation);
  function NstInvitation(NstModel) {
    function Invitation(model) {
      this.id = null;
      this.invitee = null;
      this.inviter = null;
      this.place = null;
      this.role = null;

      NstModel.call(this);

      if (model) {
        this.fill(model);
      }
    }

    Invitation.prototype = new NstModel();
    Invitation.prototype.constructor = Invitation;

    return Invitation;
  }

})();
