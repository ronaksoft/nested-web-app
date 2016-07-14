(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($q, $location, $stateParams, $scope,
                            NST_PLACE_MEMBER_TYPE, NST_STORAGE_TYPE,
                            NstSvcAuth, NstSvcServer,
                            NstPlace, NstSvcLoader) {
    var vm = this;

    if (!NstSvcAuth.isInAuthorization()) {
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
        filter: NST_PLACE_MEMBER_TYPE.CREATOR,
        name: 'Creator'
      },
      '!$insider': {
        filter: NST_PLACE_MEMBER_TYPE.KEY_HOLDER,
        name: 'Insider'
      },
      '!$member': {
        filter: NST_PLACE_MEMBER_TYPE.KNOWN_GUEST,
        name: 'Member'
      }
    };

    var parameters = {
      detail: 'full'
    };
    if (vm.filters.hasOwnProperty(vm.filter)) {
      parameters['filter'] = vm.filters[vm.filter].filter;
    }

    var memory = NstSvcStorageFactory.create('dt.places.f', NST_STORAGE_TYPE.MEMORY);
    memory.setFetchFunction(function (id) {
      if (0 === id.indexOf('places.')) {
        return NstSvcServer.request('account/get_my_places', parameters).then(function (data) {
          var places = [];
          for (var k in data.places) {
            if (parameters.filter && !data.places[k].member_type) {
              data.places[k]['member_type'] = parameters.filter;
            }
            places.push(new NstPlace(data.places[k]));
          }

          return $q(function (res) {
            res(this.places);
          }.bind({ places: places }));
        });
      } else {
        return $q(function (res, rej) {
          rej(id);
        });
      }
    });
    NstSvcLoader.inject(memory.get("places." + vm.filter).then(function (value) {
      $scope.places.places = value;
    }));
  }
})();
