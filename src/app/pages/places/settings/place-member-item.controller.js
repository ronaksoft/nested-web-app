(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceMemberItemController', PlaceMemberItemController);

  /** @ngInject */
  function PlaceMemberItemController($scope, $log, toastr,
    NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory,
    NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError) {
    var vm = this;

    vm.promote = promote;
    vm.demote = demote;
    vm.remove = remove;

    function promote() {
      NstSvcPlaceFactory.promoteMember(vm.place.id, vm.member.id).then(function (result) {
        $scope.$emit('member-promoted', {
          member : vm.member,
        });
      }).catch(function (error) {
        $log.debug(error);
      });
    }

    function demote() {
      NstSvcPlaceFactory.demoteMember(vm.place.id, vm.member.id).then(function (result) {
        $scope.$emit('member-demoted', {
          member : vm.member,
        });
      }).catch(function (error) {
        $log.debug(error);
      });
    }

    function remove() {
      if (vm.member.isPending()) {

        NstSvcInvitationFactory.revoke(vm.member.InvitationId).then(function(result) {
          $scope.$emit('member-removed', {
            member : vm.member,
          });
        }).catch(function(error) {
          $log.debug(error);
        });

      } else {

        NstSvcPlaceFactory.removeMember(vm.place.id, vm.member.id).then(function(result) {
          $scope.$emit('member-removed', {
            member : vm.member,
          });
        }).catch(function(error) {
          if (error instanceof NstPlaceOneCreatorLeftError){
            toastr.error(NstUtility.string.format('User "{0}" is the only creator in the place!', vm.member.fullName));
          } else if (error instanceof NstPlaceCreatorOfParentError) {
            toastr.error(NstUtility.string.format('You are not allowed to remove "{0}", because he/she is creator of the top-level place ({1}).', vm.member.fullName, vm.place.parent.name));
          }
          $log.debug(error);
        });
      }

    }
  }
})();
