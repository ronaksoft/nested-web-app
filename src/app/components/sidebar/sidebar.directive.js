(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, WsService, NestedPlace, $scope, $cacheFactory, LoaderService) {
      var vm = this;
      vm.places = [];
      vm.tpl = 'app/components/nested/place/row.html';

      /*if (!CacheFactory.get('placesCache')) {
        CacheFactory.createCache('placesCache', {});
        LoaderService.inject(WsService.request('account/get_my_places', {}).then(function (data) {
          var defer = $q.defer();
          for (var k in data.places) {
            placesCache.put(k, {
              place: new NestedPlace(data.places[k]),
            });

            //$scope.sidebarCtrl.places.push(new NestedPlace(data.places[k]));
          }
          defer.resolve(placesCache);

          return defer.promise;
        }).then(function () {
          fill();
        }).catch(function (reason) {

        }));
      }
      else {
        var placesCache = CacheFactory.get('placesCache');
        fill();
      }

      var placesCache = CacheFactory.get('placesCache');

      function fill() {
        var i = 0;
        for (i = 0; i < placesCache.info().size; i++) {
          vm.places.push(placesCache.get(i).place);
        }
      }*/


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
