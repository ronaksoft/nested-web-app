(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($location, AuthService, WsService, NestedPlace, $scope, $log) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    vm.places = [];
    vm.tpl = 'app/components/nested/place/row.html';

    WsService.request('account/get_my_places', {}).then(function (data) {
      for (var k in data.places) {
        $scope.places.places.push(new NestedPlace(data.places[k]));
      }
    }).catch(function (reason) {

    });
  }
})();
