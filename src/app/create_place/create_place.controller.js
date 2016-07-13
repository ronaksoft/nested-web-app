(function() {
  'use strict';

  angular
    .module('nested')
    .controller('CreatePlaceController', CreatePlaceController);

  /** @ngInject */
  function CreatePlaceController($location, $scope, $uibModal, $state, $stateParams, $q,
                                 NST_SRV_ERROR, UPLOAD_TYPE,
                                 NstSvcAuth, StoreService, NstSvcLoader,
                                 StoreItem, NestedPlace) {
    var vm = this;

    if (!NstSvcAuth.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.place = new NestedPlace(undefined, new NestedPlace($stateParams.placeId));
    $scope.place.privacy.locked = true;
    $scope.logo = null;
    $scope.leaveReason = '';

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

      NstSvcLoader.inject(p.then(function (response) {
        if (!$scope.place.picture.org.uid) {
          $scope.place.picture.org.uid = response ? response.universal_id : undefined;
          $scope.logo = null;
        }

        return $scope.place.update().then(function (place) {
          $scope.leaveReason = 'Create Place';
          $location.path('/place/' + place.id).replace();
        }).catch(function (error) {
          switch (error.err_code) {
            case NST_SRV_ERROR.ACCESS_DENIED:
              break;

            case NST_SRV_ERROR.INVALID:
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

            case NST_SRV_ERROR.DUPLICATE:
              break;

            case NST_SRV_ERROR.LIMIT_REACHED:
              break;

            default:
              break;
          }
        });
      }));
    };

    $scope.changeMe = function ($event, $toState, $toParams, $fromState, $fromParams, $cancel) {
      if ('Create Place' == $scope.leaveReason) {
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
