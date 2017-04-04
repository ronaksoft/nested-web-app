(function() {
  'use strict';

  angular.module('ronak.nested.web.user').factory('NstInvitation', NstInvitation);
  function NstInvitation() {
    function Invitation() {
      this.id = null;
      this.invitee = null;
      this.inviter = null;
      this.place = null;
      this.role = null;
      this.state = null;
    }

    Invitation.prototype = {};
    Invitation.prototype.constructor = Invitation;

    return Invitation;
  }

})();
