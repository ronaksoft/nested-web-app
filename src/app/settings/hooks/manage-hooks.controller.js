(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ManageHooksController', ManageHooksController);

  function ManageHooksController(toastr, $uibModal,
    NstSvcUserFactory, NstSvcHookFactory, NST_HOOK_EVENT_TYPE,
    NST_SRV_ERROR, NstSvcTranslation) {
    var vm = this;
    vm.hooks = [];
    vm.remove = removeHook;
    vm.NST_HOOK_EVENT_TYPE = NST_HOOK_EVENT_TYPE;

    (myHooks)();

    vm.addHook = function () {
      $uibModal.open({
        animation: false,
        size: 'unclosable',
        templateUrl: 'app/settings/hooks/partials/add-hook.html',
        controller: 'AddHookController',
        controllerAs: 'ctrl'
      }).result.then(myHooks).catch(myHooks);
    };

    function myHooks() {
      NstSvcHookFactory.list().then(function (hooks) {
        vm.hooks = hooks;
      }).catch(function () {
        vn.hooks = [];
      });
    }

    function removeHook(id) {
      // TODO : remove item from list
      NstSvcHookFactory.remove(id).then(myHooks).catch(myHooks);
    }

  }
})();
