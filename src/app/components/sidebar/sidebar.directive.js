(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, WsService, NestedPlace, $scope, LoaderService, $cacheFactory, NstSvcStorageFactory, STORAGE_TYPE) {
      var vm = this;
      vm.places = [];
      vm.tpl = 'app/components/nested/place/row.html';

      var memory = NstSvcStorageFactory.create('dt.places', STORAGE_TYPE.MEMORY);
      vm.places = memory.get('dt.places');
      if (!vm.places) {
        WsService.request('account/get_my_places', {}).then(function (data) {
          var places = [];
          for (var k in data.places) {
            places.push(new NestedPlace(data.places[k]));
          }

          memory.set('ft.places', places);
          vm.places = places;
        });
      }

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
