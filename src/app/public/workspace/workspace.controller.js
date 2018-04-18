(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('workspaceController', workspaceController);

  function workspaceController($scope, _) {

    var eventReferences = [];
    var vm = this;
    vm.progress = false;
    vm.focusCount = 1;

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
