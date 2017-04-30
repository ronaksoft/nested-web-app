(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('RecentVisitedController', RecentVisitedController);

  /** @ngInject */
  function RecentVisitedController($scope,
                                   NstSvcUserFactory) {
    var vm = this;
    vm.places = [];
    vm.loading = true;

    (function () {
      NstSvcUserFactory.getRecentlyVisitedPlace()
        .then(function (places) {
          vm.places = places;
          vm.loading = false;
        })
    })();


  }
})();
