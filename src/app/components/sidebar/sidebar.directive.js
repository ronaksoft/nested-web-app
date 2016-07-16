(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, $scope, NstSvcLoader, NstSvcPlaceFactory) {
      var vm = this;
      vm.tpl = 'app/components/nested/place/row.html';

      // TODO: Here is what we need to build the sidebar
      //    1. User Places
      //    2. User Invitations
      //    3. User Profile

      $q.all([getMyPlaces(), getInvitations()]).then(function (resolvedSet) {
        vm.places = mapPlaces(resolvedSet[0]);
        vm.invitations = mapInvitations(resolvedSet[1]);
      });

      /*****************************
       ***** Controller Methods ****
       *****************************/

      vm.acceptInvitation = function (invitation) {
        return decideInvitation(invitation, true);
      };

      vm.declineInvitation = function (invitation) {
        return decideInvitation(invitation, false);
      };

      /*****************************
       *****    Fetch Methods   ****
       *****************************/

      function getMyPlaces() {
        return NstSvcLoader.inject(NstSvcPlaceFactory.getMyTinyPlaces());
      }

      function getInvitations() {
        return NstSvcLoader.inject(NstSvcPlaceFactory.getMyTinyPlaces());
      }

      /*****************************
       *****     Map Methods    ****
       *****************************/

      function mapPlaces(places) {

      }

      function mapInvitations(invitations) {

      }

      /*****************************
       *****    Other Methods   ****
       *****************************/

      function decideInvitation(invitation, accept) {

      }

      // // Invitations
      // $scope.invitations = {
      //   length: 0,
      //   invites: {}
      // };
      // LoaderService.inject(WsService.request('account/get_invitations').then(function (data) {
      //   for (var k in data.invitations) {
      //     if (data.invitations[k].place._id) {
      //       var invitation = new NestedInvitation(data.invitations[k]);
      //       $scope.invitations.invites[invitation.id] = invitation;
      //       $scope.invitations.length++;
      //     }
      //   }
      //
      //   return $q(function (res) {
      //     res();
      //   });
      // }));
      // $scope.decideInvite = function (invitation, accept) {
      //   return invitation.update(accept).then(function (invitation) {
      //     $scope.invitations.length--;
      //     delete $scope.invitations.invites[invitation.id];
      //   });
      // };
      //
      // $scope.inviteModal = function () {
      //
      //   $uibModal.open({
      //     animation: false,
      //     templateUrl: 'app/events/partials/invitation.html',
      //     controller: 'InvitationController',
      //     size: 'sm',
      //     scope: $scope
      //   }).result.then(function () {
      //     return $location.path('/').replace();
      //   });
      // };

    })
    .directive('nestedSidebar', nestedSidebar);


  /** @ngInject */
  function nestedSidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'ctrlSidebar',
      bindToController: true
    };
  }
})();
