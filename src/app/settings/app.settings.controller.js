(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  /**
   * The app main settings page that wraps all setting pages
   *
   * @param {any} $rootScope
   * @param {any} $scope
   * @param {any} NST_USER_EVENT
   * @param {any} NstSvcAuth
   */
  function SettingsController($rootScope, $scope, NST_USER_EVENT, _, NstSvcAuth) {
    var vm = this;
    var eventReferences = [];

    vm.user = NstSvcAuth.user;

    // Updates user when the user profile changes
    eventReferences.push($rootScope.$on(NST_USER_EVENT.PROFILE_UPDATED, function (e, data) {
      vm.user = data.user;
    }));
    // Updates user when the user's profile picture changes
    eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_UPDATED, function (e, data) {
      vm.user = data.user;
    }));

    // Updates user when the user's profile picture has been removed
    eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_REMOVED, function (e, data) {
      vm.user = data.user;
    }));

    // Stops listening to all `$rootScope` events
    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
  }
})();
