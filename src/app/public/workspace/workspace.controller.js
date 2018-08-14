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
    vm.loading = false;

    vm.submitForm = submitForm;

    (function () {
      if (!$state.params.force || $state.params.force !== 'true') {
        vm.loading = true;
        var domain = localStorage.getItem(NST_SERVER_DOMAIN);
        if (domain && domain.length > 3) {
          $state.go('public.domain-redirect', {domain: domain});
        } else {
          var host = window.location.host;
          if (['nested.me', 'web.nested.me', 'webapp.nested.me'].indexOf(host) === -1) {
            changeWorkspace(host, function () {
              console.log(host);
              var parts = host.split('.');
              if (parts.length > 2) {
                parts = parts.reverse();
                var d = parts[1] + '.' + parts[0];
                if (d !== 'nested.me') {
                  console.warn(d);
                  changeWorkspace(d, function () {
                    toastr.error(NstSvcTranslation.get('Invalid domain'));
                    vm.loading = false;
                  });
                } else {
                  vm.loading = false;
                }
              }
            });
          }
        }
      }
    })();

    function submitForm() {
      changeWorkspace(vm.workspace);
    }

    function changeWorkspace(domain, callback) {
      NstSvcServer.setDomain(domain).then(function () {
        $state.go('public.domain-redirect', {domain: domain});
      }).catch(function () {
        if (typeof callback !== 'function') {
          toastr.error(NstSvcTranslation.get('Invalid domain'));
        } else {
          callback();
        }
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
