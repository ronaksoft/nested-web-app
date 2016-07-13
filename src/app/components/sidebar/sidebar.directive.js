(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, $scope, $cacheFactory,
                                               NST_STORAGE_TYPE,
                                               NstSvcLoader, NstSvcServer,
                                               NestedPlace, NstStorage) {
      var vm = this;

      // TODO: delete all commented lines
      // TODO: here is waht we need to build the sidebar
      //          1. An array of places
      //          2. The authenticated user profile

      // vm.places = [];
      // vm.tpl = 'app/components/nested/place/row.html';
      //
      // var memory = new NstStorage(NST_STORAGE_TYPE.MEMORY);
      // memory.setFetchFunction(function (id) {
      //   switch (id) {
      //     case 'places':
      //       return NstSvcServer.request('account/get_my_places', {}).then(function (data) {
      //         var places = [];
      //         for (var k in data.places) {
      //           places.push(new NestedPlace(data.places[k]));
      //         }
      //
      //         return $q(function (res) {
      //           res(this.places);
      //         }.bind({ places: places }));
      //       });
      //       break;
      //
      //     default:
      //       return $q(function (res, rej) {
      //         rej(id);
      //       });
      //       break;
      //   }
      // });
      // memory.get("places").then(function (value) {
      //   vm.places = value;
      // });

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
