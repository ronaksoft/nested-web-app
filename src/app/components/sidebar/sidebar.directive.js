(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, WsService, NestedPlace, $scope, LoaderService, $cacheFactory) {
      var vm = this;
      vm.places = [];
      vm.tpl = 'app/components/nested/place/row.html';

      if (!$cacheFactory.get('placesCache')) {
        var cache = $cacheFactory('placesCache');
        WsService.request('account/get_my_places', {}).then(function (data) {
          var defer = $q.defer();
          for (var k in data.places) {
            cache.put(k, new NestedPlace(data.places[k]));
          }
          defer.resolve(cache);

          return defer.promise;
        }).then(function () {
          fill();
        })
      }
      else {
        fill();
      }

      function fill() {
        var cache = $cacheFactory.get('placesCache');
        var i = 0;
        for (i = 0; i < cache.info().size; i++) {
          vm.places.push(cache.get(i));
        }
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
