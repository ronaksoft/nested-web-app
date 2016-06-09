(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function (WsService, NestedPlace, $scope) {
      var vm = this;
    
      vm.places = [];
      vm.tpl = 'app/components/nested/place/row.html';

      WsService.request('account/get_my_places', {}).then(function (data) {
        for (var k in data.places) {
          $scope.sidebarCtrl.places.push(new NestedPlace(data.places[k]));
        }
      }).catch(function (reason) {

      });
    })
    .directive('nestedSidebar', nestedSidebar);

  /** @ngInject */
  function nestedSidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'sidebarCtrl',
      bindToController: true
    };
  }
})();
