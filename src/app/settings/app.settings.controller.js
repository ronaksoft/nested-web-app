(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController(NST_USER_FACTORY_EVENT, NstSvcUserFactory, NstSvcAuth) {
    var vm = this;

    vm.user = NstSvcAuth.user;

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, function (event) {
      vm.user = event.detail;
    });

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PICTURE_UPDATED, function (event) {
      vm.user = event.detail;
    });

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PICTURE_REMOVED, function (event) {
      vm.user = event.detail;
    });

  }
})();
