/**
 * @file src/app/place/partials/teammates/place-teammates.controller.js
 * @author Sina Hosseini <sinaa@nested.me>
 * @description Provides a list of recently visited places 
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('RecentVisitedController', RecentVisitedController);

  /** @ngInject */
  /**
   * Displays a list of recently visited places. It drops the most recent place
   * and the selected place are the same
   * 
   * @param {any} $scope 
   * @param {any} $stateParams 
   * @param {any} NstSvcUserFactory 
   */
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
