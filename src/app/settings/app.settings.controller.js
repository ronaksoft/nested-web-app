(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SettingsController', SettingsController);

  /** @ngInject */
  function SettingsController(NstSvcAuth) {
    var vm = this;

    vm.user = NstSvcAuth.user;

  }
})();
