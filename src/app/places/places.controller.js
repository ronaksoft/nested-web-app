(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($location, AuthService, WsService, NestedPlace, $scope, $stateParams, $log) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    vm.places = [];
    vm.tpl = 'app/components/nested/place/row.html';

    vm.filter = $stateParams.filter;
    vm.filters = {
      '!$all': {
        filter: 'all',
        name: 'All'
      },
      '!$creator': {
        filter: 'creator',
        name: 'Creator'
      },
      '!$insider': {
        filter: 'insider',
        name: 'Insider'
      },
      '!$member': {
        filter: 'member',
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
        $scope.places.places.push(new NestedPlace(data.places[k]));
      }
    }).catch(function (reason) {

    });
  }
})();
