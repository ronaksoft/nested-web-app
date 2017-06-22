(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController($rootScope, $scope, NST_USER_EVENT, NstSvcUserFactory, NstSvcAuth) {
    var vm = this;
    var eventReferences = [];

    vm.user = NstSvcAuth.user;

    eventReferences.push($rootScope.$on(NST_USER_EVENT.PROFILE_UPDATED, function (e, data) {
      vm.user = data.user;
    }));

    eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_UPDATED, function (e, data) {
      vm.user = data.user;
    }));

    eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_REMOVED, function (e, data) {
      vm.user = data.user;
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
  }
})();
