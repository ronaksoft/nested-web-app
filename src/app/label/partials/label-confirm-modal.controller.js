(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('labelConfirmModalController', labelConfirmModalController);

  /** @ngInject */
  function labelConfirmModalController(modalSetting, $uibModalInstance) {
    var vm = this;

    vm.title = modalSetting.title;
    vm.body = modalSetting.body;
    vm.confirmText = modalSetting.confirmText || 'ok';
    vm.confirmColor = modalSetting.confirmColor || 'green';
    vm.cancelText = modalSetting.cancelText || 'cancel';
    vm.cancelColor = modalSetting.cancelColor || 'white';

    vm.confirm = function () {
      $uibModalInstance.close(true);
    };
  }
})();
