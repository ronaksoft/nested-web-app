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
   * @param {any} NstSvcPlaceFactory
   */
  function RecentVisitedController($scope, $stateParams,
                                   NstSvcPlaceFactory, _) {
    var vm = this;
    vm.places = [];
    vm.loading = true;

    (function () {
      NstSvcPlaceFactory.getRecentlyVisitedPlace(function(cachedPlaces) {
        vm.places = cachedPlaces;
        vm.loading = false;
      }).then(function (places) {
        var newItems = _.differenceBy(places, vm.places, 'id');
        var removedItems = _.differenceBy(vm.places, places, 'id');

        // first omit the removed items; The items that are no longer exist in fresh contacts
        _.forEach(removedItems, function (item) {
          var index = _.findIndex(vm.places, { 'id': item.id });
          if (index > -1) {
            vm.places.splice(index, 1);
          }
        });

        // add new items; The items that do not exist in cached items, but was found in fresh contacts
        vm.places.unshift.apply(vm.places, newItems);
        vm.loading = false;
      });
    })();


  }
})();
