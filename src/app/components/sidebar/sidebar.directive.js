(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedSidebar', nestedSidebar);

  /** @ngInject */
  function nestedSidebar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      scope: {},
      controller: SidebarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function SidebarController(WsService, NestedPlace, $scope) {
      var vm = this;

      vm.places = [];
      vm.tpl = 'app/components/nested/place/row.html';

      WsService.request('account/get_my_places', {}).then(function (data) {
        for (var k in data.places) {
          $scope.vm.places.push(new NestedPlace(data.places[k]));
        }
      }).catch(function (reason) {

      });
    }
  }

})();
