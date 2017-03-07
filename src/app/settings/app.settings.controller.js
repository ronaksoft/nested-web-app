(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController(NST_USER_FACTORY_EVENT, NstSvcAuth, NstVmUser , NstSvcUserFactory) {
    var vm = this;

    vm.user = NstSvcAuth.user;

    NstSvcUserFactory.addEventListener(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, function (event) {
      vm.user = event.detail;
    });


    // function mapUser(userModel) {
    //   return new NstVmUser(userModel);
    // }

  }
})();
