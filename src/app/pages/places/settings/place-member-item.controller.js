(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMemberItemController', PlaceMemberItemController);

  /** @ngInject */
  function PlaceMemberItemController($scope, $log, toastr,
    NstSvcModal, NstUtility,
    NstSvcPlaceFactory, NstSvcTranslation, NstSvcLogger, NstSvcAuth,
    NST_SRV_ERROR) {
    var vm = this;

    vm.promote = promote;
    vm.demote = demote;
    vm.remove = remove;
    vm.isCurrent = NstSvcAuth.user.id === vm.member.id;

    function promote() {

      NstSvcPlaceFactory.promoteMember(vm.place.id, vm.member.id).then(function () {
        vm.place.counters.creators++;
        vm.place.counters.key_holders--;
        $scope.$emit('member-promoted', {
          member: vm.member
        });
      });
    }

    function demote() {

      if (!vm.member.isPending || !vm.place) {
        $scope.$emit('member-demoted', {
          member: vm.member
        });
        return;
      }

      NstSvcPlaceFactory.demoteMember(vm.place.id, vm.member.id).then(function () {
        vm.place.counters.key_holders++;
        vm.place.counters.creators--;
        $scope.$emit('member-demoted', {
          member: vm.member
        });
      });
    }

    function remove() {

      var message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to remove {0}?'), vm.member.fullName);

      NstSvcModal.confirm(
        NstSvcTranslation.get('Remove Member'),
        message,
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {

        if (!result) return;

       /* if (!vm.place){
          $scope.$emit('member-removed', {
            member : vm.member,
            place: vm.place
          });
          return;
        }*/

        removeMember().then(function () {
          return NstSvcPlaceFactory.get(vm.place.id);
        }).then(function (newPlace) {
          if (result) {
            if (vm.member.role === 'creator') {
              vm.place.counters.creators--;
            } else if (vm.member.role === 'key_holder') {
              vm.place.counters.key_holders--;
            }

            NstSvcPlaceFactory.set(newPlace);
            $scope.$emit('member-removed', {
              member: vm.member,
              place: newPlace
            });
          }

        }).catch(function (error) {
          if (error.code === NST_SRV_ERROR.ACCESS_DENIED) {
            switch (error.message[0]) {
              case 'last_creator':
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('User {0} is the only Manager of this Place!'), vm.member.name));
                break;
              case 'parent_creator':
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to remove {0}, because he/she is the creator of its highest-ranking Place ({1}).'), vm.member.name, vm.place.parent.name));
                break;
              default:
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('An error has occured while trying to remove the member')));
                break;
            }
            return;
          }

          toastr.error(NstUtility.string.format(NstSvcTranslation.get('An error has occured while trying to remove the member')));
        });
      })
    }

    function removeMember() {
      return NstSvcPlaceFactory.removeMember(vm.place.id, vm.member.id);
    }
  }
})();
