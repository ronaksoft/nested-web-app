(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AccountProfileController', AccountProfileController);

  /** @ngInject */
  function AccountProfileController($location, $scope, $timeout, $log,
                                    UPLOAD_TYPE,
                                    AuthService, StoreService, $uibModal) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.logo = null;
    $scope.user = AuthService.user;

    $scope.showUploadProgress = false;

    vm.imgToUri = function (event) {
      vm.loadedSize = 0;
      $scope.showUploadProgress = true;
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.user.picture.org.url = event.target.result;

          var uploadSettings = {
            file : $scope.logo,
            cmd : UPLOAD_TYPE.PROFILE_PICTURE,
            // progress is invoked at most once per every second
            onProgress : _.throttle(function (e) {
              if (e.lengthComputable) {
                vm.loadedSize = (e.loaded/e.total)*100;
                $timeout(function () {
                  $scope.totalProgress = vm.loadedSize.toFixed(0);
                });
              }
            }.bind(),100),
            onStart : function (e) {
              $scope.showUploadProgress = true;
            }
          };

          return StoreService.uploadWithProgress(uploadSettings).then(function (handler) {
            $scope.user.picture.org.uid = handler.universal_id;
            $scope.logo = null;
            handler.start().then(function (response) {
              $scope.showUploadProgress = false;
              return $scope.user.setPicture(response.data.universal_id);
            }).catch(function (result) {
              $log.debug(result);
            });
          }).catch(function (error) {
            $log.debug(error);
          });

        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.removeImg = function () {
      $scope.user.setPicture();
    };

    $scope.leaveReason = '';
    $scope.changeMe = function ($event, $toState, $toParams, $fromState, $fromParams, $cancel) {
      if ('Save & Exit' == $scope.leaveReason) {
        $cancel.$destroy();
        $state.go($toState.name);

      } else {
        vm.confirmModal = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'app/account/profile/confirmprofile.html',
            controller: 'WarningController',
            size: 'sm',
            scope: $scope
          }).result.then(function () {
            $cancel.$destroy();
            $state.go($toState.name);
          }).catch(function () {

          });

          return false;
        };

        vm.confirmModal();
      }
    };
  }
})();
