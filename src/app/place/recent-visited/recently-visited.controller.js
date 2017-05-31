(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('RecentVisitedController', RecentVisitedController);

  /** @ngInject */
  function RecentVisitedController($scope, $stateParams,
                                   NstSvcUserFactory) {
    var vm = this;
    vm.places = [];
    vm.loading = true;

    (function () {
      NstSvcUserFactory.getRecentlyVisitedPlace()
        .then(function (places) {

          var latest = _.head(places);
          if (latest && latest.id === $stateParams.placeId) {
            vm.places = _.drop(places, 1);
          } else {
            vm.places = places;
          }
          vm.loading = false;

        })
    })();


  }
})();
