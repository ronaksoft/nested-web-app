/**
 * @file src/app/contacts/partials/fav-contacts.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Populates a list of favorite contacts
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('FavoriteAppsController', FavoriteAppsController);

  function FavoriteAppsController(_, $state, $rootScope, $scope,
    NstSvcAppFactory, NstUtility) {
    var vm = this,
        MAX_ITEMS_COUNT = 30,
        eventReferences = [];
    vm.apps = [];

    (function () {

      vm.loadProgress = true;
      // Gets all contacts and filter by `isFavorite`. Then orders by lastnam and limits the number of contacts to 30
      NstSvcAppFactory.getAllTokens().then(function (apps) {
        vm.apps = _.map(apps, function(app){ return app.app});
        
      }).catch(function () {
        vm.errorLoad = true;
      }).finally(function () {
        vm.loadProgress = false;
      });

    })();

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

    function filterFavorites(contacts) {
      return _.chain(contacts).filter({ 'starred': true }).orderBy(['name'], ['asc']).take(MAX_ITEMS_COUNT).value();
    }

  }
})();