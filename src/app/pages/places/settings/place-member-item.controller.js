(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMemberItemController', PlaceMemberItemController);

  /** @ngInject */
  function PlaceMemberItemController($scope, $log, toastr,
    NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory, NstSvcTranslation, NstSvcLogger, NstSvcAuth,
    NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError) {
    var vm = this;

    vm.promote = promote;
    vm.demote = demote;
    vm.remove = remove;
    vm.isCurrent = NstSvcAuth.user.id === vm.member.id;

    function promote() {

      NstSvcPlaceFactory.promoteMember(vm.place.id, vm.member.id).then(function (result) {
        vm.place.counters.creators++;
        vm.place.counters.key_holders--;
        $scope.$emit('member-promoted', {
          member : vm.member
        });
      }).catch(function (error) {
        $log.debug(error);
      });
    }

    function demote() {

      if (!vm.member.isPending || !vm.place){
        $scope.$emit('member-demoted', {
          member : vm.member
        });
        return;
      }

      NstSvcPlaceFactory.demoteMember(vm.place.id, vm.member.id).then(function (result) {
        vm.place.counters.key_holders++;
        vm.place.counters.creators--;
        $scope.$emit('member-demoted', {
          member : vm.member
        });
      }).catch(function (error) {
        $log.debug(error);
      });
    }

    function remove() {

      if (!vm.member.isPending || !vm.place){
        $scope.$emit('member-removed', {
          member : vm.member
        });
        return;
      }

      removeMember().then(function (result) {
        return NstSvcPlaceFactory.get(vm.place.id);
      }).then(function (place) {

        if (vm.member.role === 'creator') {
          vm.place.counters.creators --;
        } else if (vm.member.role === 'key_holder') {
          vm.place.counters.key_holders --;
        }

        NstSvcPlaceFactory.set(place);
        $scope.$emit('member-removed', {
          member : vm.member,
          placeId: vm.place.id
        });

      }).catch(function (error) {
        if (error instanceof NstPlaceOneCreatorLeftError){
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('User {0} is the only Manager of this Place!'), vm.member.name));
        } else if (error instanceof NstPlaceCreatorOfParentError) {
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to remove {0}, because he/she is the creator of its highest-ranking Place ({1}).'), vm.member.name, vm.place.parent.name));
        } else {
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('An error has occured while trying to remove the member')));
        }
      });
    }

    function removeMember() {
      return vm.member.isPending() ? NstSvcInvitationFactory.revoke(vm.member.InvitationId) : NstSvcPlaceFactory.removeMember(vm.place.id, vm.member.id);
    }
  }
})();
