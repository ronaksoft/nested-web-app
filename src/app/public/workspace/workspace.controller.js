(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('workspaceController', workspaceController);

  function workspaceController($scope, $state, _, toastr, NstSvcTranslation, NstSvcServer) {

    var eventReferences = [];
    var vm = this;
    vm.progress = false;
    vm.focusCount = 1;

    vm.submitForm = submitForm;

    function submitForm() {
      NstSvcServer.setDomain(vm.workspace).then(function () {
        $state.go('public.domain-redirect', {domain: vm.workspace});
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Invalid domain'));
      });
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
