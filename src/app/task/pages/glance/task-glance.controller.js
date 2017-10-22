(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('taskGlanceController', taskGlanceController);

  function taskGlanceController($rootScope, $scope, _, $state, NstSvcTaskFactory, NST_TASK_STATUS) {
    var vm = this;
    var eventReferences = [];

    // vm.user = NstSvcAuth.user;
    vm.taskSetting = {
      limit: 8,
      skip: 0
    };

    vm.tasks = [];

    loadTasks();

    vm.editTask = editTask;

    function loadTasks() {
      NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.CREATED_BY_ME, null, vm.taskSetting.skip, vm.taskSetting.limit).then(function (tasks) {
        vm.tasks = vm.tasks.concat(tasks);
        _.uniqBy(vm.tasks, 'id');
        vm.taskSetting.skip = vm.tasks.length;
      });
    }

    function editTask(id) {
      $state.go('app.task.edit', {
        taskId: id
      });
    }

    eventReferences.push($rootScope.$on('task-created', function () {
      vm.taskSetting.limit = 8;
      vm.taskSetting.skip = 0;
      loadTasks();
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
