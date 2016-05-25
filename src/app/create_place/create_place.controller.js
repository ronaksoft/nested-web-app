(function() {
  'use strict';

  angular
    .module('nested')
    .controller('CreatePlaceController', CreatePlaceController);

  /** @ngInject */
  function CreatePlaceController($location, $scope, $stateParams, $q, WS_ERROR, AuthService, StoreService, UPLOAD_TYPE, StoreItem, NestedPlace) {
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

    vm.removeImg = function () {
      $scope.place.picture.org.url = null;
      $scope.place.picture.org.uid = null;
    };

    vm.create = function () {
      var p = $scope.logo ? StoreService.upload($scope.logo, UPLOAD_TYPE.PLACE_PICTURE) : $q(function (res) { res(); });

      p.then(function (response) {
        if (!$scope.place.picture.org.uid) {
          $scope.place.picture.org.uid = response ? response.universal_id : undefined;
          $scope.logo = null;
        }

        return $scope.place.update().then(function (place) {
          console.log('Everything is ok', arguments);
          $location.path('/place/' + place.id);
        }).catch(function (error) {
          switch (error.err_code) {
            case WS_ERROR.ACCESS_DENIED:
              break;

            case WS_ERROR.INVALID:
              // TODO: Enable error message tooltips on view
              for (var k in error.items) {
                switch (error.items[k]) {
                  case 'place_id':
                    $scope.place.id = null;
                    break;

                  case 'place_name':
                    $scope.place.name = null;
                    break;

                  case 'place_desc':
                    $scope.place.description = null;
                    break;
                }
              }
              break;

            case WS_ERROR.DUPLICATE:
              break;

            default:
              break;
          }
        });
      });
    };
  }
})();
