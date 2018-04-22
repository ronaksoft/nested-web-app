(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('workspaceController', workspaceController);

  function workspaceController($scope, $state, _) {

    var eventReferences = [];
    var vm = this;
    vm.progress = false;
    vm.focusCount = 1;

    vm.submitForm = submitForm;

    function submitForm() {
      $state.go('public.domain-redirect', {domain: vm.workspace});
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
