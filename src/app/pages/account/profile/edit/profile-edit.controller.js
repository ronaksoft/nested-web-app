(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ProfileEditController', ProfileEditController);

  /** @ngInject */
  function ProfileEditController($scope, $state, $q, $uibModal,
                                 NST_STORE_UPLOAD_TYPE,
                                 NstSvcLoader, NstSvcAuth, NstSvcStore, NstSvcUserFactory) {
    var vm = this;

    getUser().then(function (resolvedSet) {
      vm.user = mapUser(resolvedSet);
    });

    function getUser() {
      return NstSvcLoader.inject($q(function (res) {
        res(NstSvcAuth.getUser());
      }));
    }

    function mapUser(user) {
      return {
        id : user.getId(),
        avatar : user.getPicture().getThumbnail(128).getUrl().view,
        fname : user.getFirstName(),
        lname : user.getLastName(),
        phone : user.getPhone()
      };
    }

    vm.update = function () {
      NstSvcUserFactory.save(vm.user);
    };

    $scope.logo = null;
    $scope.user = NstSvcAuth.user;

    vm.imgToUri = function (event) {
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.user.picture.org.url = event.target.result;

          return NstSvcStore.upload($scope.logo, NST_STORE_UPLOAD_TYPE.PROFILE_PICTURE).then(function (response) {
            $scope.user.picture.org.uid = response.universal_id;
            $scope.logo = null;

            return $scope.user.setPicture(response.universal_id);
          });
        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.removeImg = function () {
      $scope.user.setPicture();
    };

    $scope.leaveReason = '';
    $scope.changeMe = function (event, toState, toParams, fromState, fromParams, cancel) {
      if ('Save & Exit' == $scope.leaveReason) {
        cancel.$destroy();
        $state.go(toState.name);

      } else {
        vm.confirmModal = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'app/account/profile/confirmprofile.html',
            controller: 'WarningController',
            size: 'sm',
            scope: $scope
          }).result.then(function () {
            cancel.$destroy();
            $state.go(toState.name);
          }).catch(function () {

          });

          return false;
        };

        vm.confirmModal();
      }
    };
  }
})();
