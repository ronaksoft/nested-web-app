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

  function FavoriteAppsController(_, $state, $rootScope, $scope, $uibModal,
    NstSvcAppFactory, NstUtility) {
    var vm = this,
        MAX_ITEMS_COUNT = 30,
        eventReferences = [];
    vm.apps = [];

    vm.loadApp = loadApp;
    vm.openApps = openApps;
    vm.gotoAddApps = gotoAddApps;
    
    function getApps() {
      NstSvcAppFactory.getAllTokens().then(function (apps) {
        vm.apps = apps;
      }).catch(function () {
        vm.errorLoad = true;
      }).finally(function () {
        vm.loadProgress = false;
      });
    }

    function loadApp(id) {
      $rootScope.$broadcast('app-load-externally', {
        appId: id,
      });
    }

    function gotoAddApps() {
      $uibModal.open({
        animation: false,
        size: '960',
        templateUrl: 'app/settings/apps/partials/create-token.html',
        controller: 'CreateTokenController',
        resolve: {
          myApps: function () {
            console.log(vm.apps);
            return vm.apps;
          }
        },
        controllerAs: 'ctrl'
      }).result.then(function(){search()}).catch(function(){search()});
    }

    (function () {
      vm.loadProgress = true;
      getApps();
      eventReferences.push(
        $rootScope.$on('remove-token', getApps)
      );
      eventReferences.push(
        $rootScope.$on('add-token', getApps)
      );
    })();

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

    function openApps($event) {
      $state.go('app.applications', {}, {
        notify: false
      });
    }
  
    function filterFavorites(contacts) {
      return _.chain(contacts).filter({ 'starred': true }).orderBy(['name'], ['asc']).take(MAX_ITEMS_COUNT).value();
    }

  }
})();
