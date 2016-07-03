(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($q, $location, $stateParams, $scope, $rootScope,
                            AuthService, WsService, NestedPlace, MEMBER_TYPE, LoaderService, NstSvcStorageFactory, STORAGE_TYPE) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
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
      }
    };

    var parameters = {
      detail: 'full'
    };
    if (vm.filters.hasOwnProperty(vm.filter)) {
      parameters['filter'] = vm.filters[vm.filter].filter;
    }
    var memory = NstSvcStorageFactory.create('dt.places.f', STORAGE_TYPE.MEMORY);

    function load() {
      var defer = $q.defer();

      vm.places = memory.get("places." + vm.filter);
      if (!vm.places || vm.places.length === 0) {
        WsService.request('account/get_my_places', parameters).then(function (data) {
          var places = [];
          for (var k in data.places) {
            if (parameters.filter && !data.places[k].member_type) {
              data.places[k]['member_type'] = parameters.filter;
            }
            places.push(new NestedPlace(data.places[k]));
          }

          vm.places = places;
          memory.set("places." + vm.filter, places);
          defer.resolve();
        });
      } else {
        defer.resolve();
      }

      return defer.promise;
    }

    LoaderService.inject(load());

    $rootScope.$on('place-removed', function (context, data) {
      this.memory.flush();
      load();
    }.bind({ memory : memory }));

    $rootScope.$on('place-added', function (context, data) {
      this.memory.flush();
      load();
    }.bind({ memory : memory }));
  }
})();
