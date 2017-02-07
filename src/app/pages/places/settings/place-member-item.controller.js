(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMemberItemController', PlaceMemberItemController);

  /** @ngInject */
  function PlaceMemberItemController($scope, $log, toastr,
    NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory, NstSvcTranslation,
    NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError) {
    var vm = this;

    vm.promote = promote;
    vm.demote = demote;
    vm.remove = remove;

    function promote() {
      NstSvcPlaceFactory.promoteMember(vm.place.id, vm.member.id).then(function (result) {
        vm.place.counters.creators++;
        $scope.$emit('member-promoted', {
          member : vm.member
        });
      }).catch(function (error) {
        $log.debug(error);
      });
    }

    function demote() {
      NstSvcPlaceFactory.demoteMember(vm.place.id, vm.member.id).then(function (result) {
        --vm.place.counters.creators;
        $scope.$emit('member-demoted', {
          member : vm.member
        });
      }).catch(function (error) {
        $log.debug(error);
      });
    }

    function remove() {
      if (vm.member.isPending()) {

        NstSvcInvitationFactory.revoke(vm.member.InvitationId).then(function(result) {
          $scope.$emit('member-removed', {
            member : vm.member
          });
        }).catch(function(error) {
          $log.debug(error);
        });

      } else {

        NstSvcPlaceFactory.removeMember(vm.place.id, vm.member.id).then(function(result) {
          $scope.$emit('member-removed', {
            member : vm.member
          });
        }).catch(function(error) {
          if (error instanceof NstPlaceOneCreatorLeftError){
            toastr.error(NstUtility.string.format(NstSvcTranslation.get('User "{0}" is the only Manager of this Place!'), vm.member.name));
          } else if (error instanceof NstPlaceCreatorOfParentError) {
            toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to remove "{0}", because he/she is the creator of its highest-ranking Place ({1}).'), vm.member.name, vm.place.parent.name));
          }
          $log.debug(error);
        });
      }

    }
  }
})();
