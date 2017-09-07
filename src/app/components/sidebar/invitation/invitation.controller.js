(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('InvitationController', function ($state, $scope, $uibModalInstance, argv,
                                                  NST_CONFIG, NST_INVITATION_FACTORY_STATE) {
      var vm = this;

      /*****************************
       *** Controller Properties ***
       *****************************/
      vm.domain = NST_CONFIG.DOMAIN;
      vm.urls = {
        place: $state.href(getPlaceState(), {placeId: argv.invitation.place.id})
      };
      vm.invitation = argv.invitation;
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
    });
})();
