(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('workspaceController', workspaceController);

  function workspaceController($scope, $state, _, toastr, $timeout, NstSvcTranslation, NstSvcServer, NstSvcConfigFinder) {

    var NST_SERVER_DOMAIN = 'nested.server.domain';

    var eventReferences = [];
    var vm = this;
    vm.progress = false;
    vm.focusCount = 1;
    vm.loading = false;

    vm.submitForm = submitForm;

    (function () {
      if (!$state.params.force || $state.params.force !== 'true') {
        vm.loading = true;
        var domain = localStorage.getItem(NST_SERVER_DOMAIN);
        if (domain && domain.length > 3) {
          gotoWorkspace(domain);
        } else {
          var host = window.location.host;
          NstSvcConfigFinder.getConfig(host).then(function (domainName) {
            gotoWorkspace(domainName);
          }).catch(function () {
            toastr.error(NstSvcTranslation.get('Invalid domain'));
            vm.loading = false;
          });
        }
      }
    })();

    $timeout(function () {
      vm.loading = false;
    }, 3000);

    function submitForm() {
      NstSvcConfigFinder.getConfig(vm.workspace).then(function (domainName) {
        gotoWorkspace(domainName);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Invalid domain'));
      });
    }

    function gotoWorkspace(domain) {
      $state.go('public.domain-redirect', {domain: domain});
      vm.loading = false;
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
