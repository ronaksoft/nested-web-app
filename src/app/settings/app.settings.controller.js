(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController(NST_USER_FACTORY_EVENT, NstSvcUserFactory) {
    var vm = this;

    vm.user = NstSvcUserFactory.currentUser;

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, function (event) {
      vm.user = event.detail;
    });

  }
})();
