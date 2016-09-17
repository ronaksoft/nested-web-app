(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceInvitationFriend', NstSvcPlaceInvitationFriend);

  function NstSvcPlaceInvitationFriend($log, $injector,
    NST_INVITATION_FACTORY_EVENT,
    NstSvcPlaceFactory) {
      console.log('lolo');
      if ($injector.has('NstSvcInvitationFactory')) {
        var invitationFactory = $injector.get('NstSvcInvitationFactory');

         invitationFactory.addEventListener(NST_INVITATION_FACTORY_EVENT.ACCEPT, function(event) {
          var invitation = event.detail.invitation;
          $log.debug('Place Factory | Invitation Accepted: ', invitation);

          NstSvcPlaceFactory.addToMyPlaceIds(invitation.getPlace().getId());
        });
      }

  }
})();
