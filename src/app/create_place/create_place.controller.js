(function() {
  'use strict';

  angular
    .module('nested')
    .controller('CreatePlaceController', CreatePlaceController);

  /** @ngInject */
  function CreatePlaceController($location, $scope, $stateParams, $q, AuthService, StoreService, UPLOAD_TYPE, StoreItem, NestedPlace) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.place = new NestedPlace(undefined, new NestedPlace($stateParams.placeId));
    $scope.place.privacy.locked = true;
    $scope.logo = null;

    vm.imgToUri = function (event) {
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.place.picture.org.url = event.target.result;
        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.create = function () {
      var p = $scope.logo ? StoreService.upload($scope.logo, UPLOAD_TYPE.PLACE_PICTURE) : $q(function (res) { res(); });

      p.then(function (response) {
        $scope.place.picture.org = new StoreItem(response ? response.universal_id : undefined);
        return $scope.place.update().then(function (place) {
          $location.path('/place/' + place.id);
        });
      });
    };
  }
})();
