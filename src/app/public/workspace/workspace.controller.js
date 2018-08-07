(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('workspaceController', workspaceController);

  function workspaceController($scope, $state, _, toastr, NstSvcTranslation, NstSvcServer) {

    var NST_SERVER_DOMAIN = 'nested.server.domain';

    var eventReferences = [];
    var vm = this;
    vm.progress = false;
    vm.focusCount = 1;

    vm.submitForm = submitForm;

    (function () {
      if (!$state.params.force || $state.params.force !== 'true') {
        var domain = localStorage.getItem(NST_SERVER_DOMAIN);
        if (domain && domain.length > 3) {
          $state.go('public.domain-redirect', {domain: domain});
        } else {
          var host = window.location.host;
          if (['nested.me', 'web.nested.me', 'webapp.nested.me'].indexOf(host) === -1) {
            changeWorkspace(host);
          }
        }
      }
    })();

    function submitForm() {
      changeWorkspace(vm.workspace);
    }

    function changeWorkspace(domain) {
      NstSvcServer.setDomain(domain).then(function () {
        $state.go('public.domain-redirect', {domain: domain});
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
