(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceInvitationFriend', NstSvcPlaceInvitationFriend);

  function NstSvcPlaceInvitationFriend($log,
                                       NST_INVITATION_FACTORY_EVENT,
                                       NstSvcPlaceFactory, NstSvcInvitationFactory) {
    NstSvcInvitationFactory.addEventListener(NST_INVITATION_FACTORY_EVENT.ACCEPT, function (event) {
      var invitation = event.detail.invitation;
      $log.debug('Place Factory | Invitation Accepted: ', invitation);

      NstSvcPlaceFactory.addToMyPlaceIds(invitation.getPlace().getId());
    });
  }
})();
