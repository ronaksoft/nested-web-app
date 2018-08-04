(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('EmailSetupController', EmailSetupController);

  function EmailSetupController($rootScope, $scope, toastr, $uibModal, $timeout,
    NstSvcUserFactory, NstSvcTaskUtility, NstSvcAuth,
    NST_SRV_ERROR, NST_CONFIG) {
    var vm = this;
    var eventReferences = [];
    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);
    vm.change = change;
    vm.service = 'Gmail';

    vm.model = {
      host: '',
      port: 25,
      username: '',
      password: '',
      status: true,
    };

    (function () {
      // NstSvcUserFactory.removeEmail()
    })();

    function change(isValid) {
      // Sets submitted to true to make the enable form validation on any field change
      vm.submitted = true;
      if (vm.model.username.indexOf('@') === -1) {
        if (vm.service === 'Gmail') {
          vm.model.username += '@gmail.com'
        }
        if (vm.service === 'Yahoo') {
          vm.model.username += '@yahoo.com'
        }
      }

      if (isValid) {
        NstSvcUserFactory.updateEmail(vm.model).then(console.log).catch(console.log)
      }
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
