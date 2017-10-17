(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('taskGlanceController', taskGlanceController);

  function taskGlanceController($rootScope, $scope, $state) {
    var vm = this;
    // var eventReferences = [];

    // vm.user = NstSvcAuth.user;

    vm.editTask = editTask;

    function editTask(id) {
      $state.go('app.task.edit', {
        taskId: id
      });
    }
  }
})();
