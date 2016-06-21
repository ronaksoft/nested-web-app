(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AccountProfileController', AccountProfileController);

  /** @ngInject */
  function AccountProfileController($location, $scope,
                                    UPLOAD_TYPE,
                                    AuthService, StoreService) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.logo = null;
    $scope.user = AuthService.user;

    vm.imgToUri = function (event) {
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.user.picture.org.url = event.target.result;

          return StoreService.upload($scope.logo, UPLOAD_TYPE.PROFILE_PICTURE).then(function (response) {
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
  }
})();
