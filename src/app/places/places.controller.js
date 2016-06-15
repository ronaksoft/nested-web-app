(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($location, $stateParams, $scope, AuthService, WsService, NestedPlace, MEMBER_TYPE, ngProgressFactory) {
    var vm = this;

    $scope.progressbar = ngProgressFactory.createInstance();

    $scope.progressbar.setHeight('5px');
    $scope.progressbar.complete();
    $scope.progressbar.start();

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    vm.places = [];

    vm.filter = $stateParams.filter;
    vm.filters = {
      '!$all': {
        filter: 'all',
        name: 'All'
      },
      '!$creator': {
        filter: MEMBER_TYPE.CREATOR,
        name: 'Creator'
      },
      '!$insider': {
        filter: MEMBER_TYPE.KEY_HOLDER,
        name: 'Insider'
      },
      '!$member': {
        filter: MEMBER_TYPE.KNOWN_GUEST,
        name: 'Member'
      },
      '!$browse': {
        filter: 'browse',
        name: 'Browse'
      }
    };

    var parameters = {
      detail: 'full'
    };
    if (vm.filters.hasOwnProperty(vm.filter)) {
      parameters['filter'] = vm.filters[vm.filter].filter;
    }

    WsService.request('account/get_my_places', parameters).then(function (data) {
      for (var k in data.places) {
        if (parameters.filter && !data.places[k].member_type) {
          data.places[k]['member_type'] = parameters.filter;
        }

        $scope.places.places.push(new NestedPlace(data.places[k]));
      }
      $scope.progressbar.complete();
    }).catch(function (reason) {

    });
  }
})();
