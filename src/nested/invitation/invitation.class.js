(function() {
  'use strict';

  angular.module('nested').factory('NstInvitation', NstInvitation);
  function NstInvitation(NstModel) {
    function Invitation(model) {
      NstModel.call(this);

      this.id = null;
      this.invitee = null;
      this.inviter = null;
      this.place = null;
      this.role = null;

      this.fill(model);

      return this;
    }

    Invitation.prototype = new NstModel();
    Invitation.prototype.constructor = Invitation;
  }
  
})();
