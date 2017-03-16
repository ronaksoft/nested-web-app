(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('InvitationController', function ($state, $scope, $uibModalInstance, NstVmInvitation, argv, NST_INVITATION_FACTORY_STATE){
      var vm = this;

      /*****************************
       *** Controller Properties ***
       *****************************/

      vm.urls = {
        place: $state.href(getPlaceState(), { placeId: argv.invitation.getPlace().getId() })
      };
      vm.invitation = mapInvitation(argv.invitation);
      vm.NST_INVITATION_FACTORY_STATE = NST_INVITATION_FACTORY_STATE;

      /*****************************
       ***** Controller Methods ****
       *****************************/

      vm.accept = function () {
        $uibModalInstance.close(true);
      };

      vm.decline = function () {
        $uibModalInstance.close(false);
      };

      vm.close = function () {
        $uibModalInstance.dismiss();
      };

      /*****************************
       *****  Controller Logic  ****
       *****************************/

      /*****************************
       *****    State Methods   ****
       *****************************/

      function getPlaceState() {
        var state = 'place-messages';
        switch ($state.current.name) {
          case 'activity':
          case 'place-activity':
            state = 'place-activity';
            break;
        }

        return state;
      }

      /*****************************
       *****    Fetch Methods   ****
       *****************************/

      /*****************************
       *****     Map Methods    ****
       *****************************/

      function mapInvitation(invitationModel) {
        return new NstVmInvitation(invitationModel);
      }
    })
})();
