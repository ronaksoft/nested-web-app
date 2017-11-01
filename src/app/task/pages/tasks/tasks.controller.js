(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TasksController', TasksController);

  function TasksController($rootScope, $scope, _, $state, NstSvcTaskFactory, NST_TASK_STATUS, NstSvcTaskUtility, $timeout, toastr, NstSvcTranslation, NstUtility) {
    var vm = this;
    var eventReferences = [];

    // vm.user = NstSvcAuth.user;
    vm.loading = true;
    vm.firstTimeLoading = true;
    vm.taskSetting = {
      limit: 8,
      skip: 0
    };

    vm.isGlancePage = false;
    vm.isAssignedToMePage = false;
    vm.isCreatedByMePage = false;
    vm.isWatchlistPage = false;
    vm.isCustomFilterPage = false;
    vm.editTask = editTask;
    vm.acceptTask = acceptTask;
    vm.declineTask = declineTask;
    vm.getTaskIcon = NstSvcTaskUtility.getTaskIcon;

    vm.overDueTasks = [];
    vm.pendingTasks = [];
    vm.tasks = [];

    setLocationFlag();
    loadTasks();
    if (vm.isGlancePage) {
      getOverdueTasks();
      getPendingTasks();
    }

    function setLocationFlag() {
      switch ($state.current.name) {
        default:
        case 'app.task.glance':
          vm.isGlancePage = true;
          break;
        case 'app.task.assigned_to_me':
          vm.isAssignedToMePage = true;
          break;
        case 'app.task.created_by_me':
          vm.isCreatedByMePage = true;
          break;
        case 'app.task.watchlist':
          vm.isWatchlistPage = true;
          break;
        case 'app.task.custom_filter':
          vm.isCustomFilterPage = true;
          break;
      }
    }

    function mergeTask(tasks) {
      var newItems = _.differenceBy(tasks, vm.tasks, 'id');
      // var removedItems = _.differenceBy(vm.tasks, tasks, 'id');
      //
      // _.forEach(removedItems, function (item) {
      //   var index = _.findIndex(vm.tasks, {
      //     'id': item.id
      //   });
      //   if (index > -1) {
      //     vm.tasks.splice(index, 1);
      //   }
      // });

      vm.tasks.unshift.apply(vm.tasks, newItems);
    }

    function replaceTask(id) {
      var index = _.findIndex(vm.tasks, {id: id});
      NstSvcTaskFactory.get(id).then(function (task) {
        vm.tasks[index] = task;
      }).catch(function () {
        vm.tasks.splice(index, 1);
      });
    }

    function getOverdueTasks() {
      NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.ASSIGNED_TO_ME, NST_TASK_STATUS.OVERDUE).then(function (tasks) {
        vm.overDueTasks = tasks;
      });
    }

    function getPendingTasks() {
      NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.CANDIDATE, NST_TASK_STATUS.NO_ASSIGNED).then(function (tasks) {
        vm.pendingTasks = tasks;
      });
    }

    function getTasks() {
      vm.loading = true;
      var promise;

      if (vm.isGlancePage) {
        promise = NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.GLANCE, null, vm.taskSetting.skip, vm.taskSetting.limit);
      } else if (vm.isAssignedToMePage) {
        promise = NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.ASSIGNED_TO_ME, null, vm.taskSetting.skip, vm.taskSetting.limit);
      } else if (vm.isCreatedByMePage) {
        promise = NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.CREATED_BY_ME, null, vm.taskSetting.skip, vm.taskSetting.limit);
      } else if (vm.isWatchlistPage) {
        promise = NstSvcTaskFactory.getByFilter(NST_TASK_STATUS.WATCHED, null, vm.taskSetting.skip, vm.taskSetting.limit);
      }

      promise.then(function (tasks) {
        vm.reachedTheEnd = tasks.length < vm.taskSetting.limit;
      }).catch(function () {

      }).finally(function () {
        vm.loading = false;
      });

      return promise;
    }

    function appendTasks(tasks) {
      var items = _.differenceBy(tasks, vm.tasks, 'id');
      vm.tasks.push.apply(vm.tasks, items);
    }

    function fillThePage() {
      if (vm.firstTimeLoading && !vm.reachedTheEnd) {
        $timeout(function () {
          if (!isPageFilled()) {
            loadMoreTasks();
            fillThePage();
          } else {
            vm.firstTimeLoading = false;
          }
        }, 100);
      }
    }

    function loadTasks() {
      getTasks().then(function (tasks) {
        mergeTask(tasks);
        vm.taskSetting.skip = vm.tasks.length;

        // to full fill page at first loading
        fillThePage();
      });
    }

    function loadMoreTasks() {
      if (vm.loading && !vm.reachedTheEnd) {
        return;
      }
      getTasks().then(function (tasks) {
        appendTasks(tasks);
        vm.taskSetting.skip = vm.tasks.length;
      });
    }

    function isPageFilled() {
      var taskContainer = angular.element('#task-container');
      if (window.innerHeight > taskContainer.offset().top + taskContainer.height()) {
        return false;
      } else {
        return true;
      }
    }

    function editTask(id) {
      $state.go('app.task.edit', {
        taskId: id
      }, {
        notify: false
      });
    }

    function acceptTask(id) {
      NstSvcTaskFactory.respond(id, NST_TASK_STATUS.ACCEPT).then(function () {
        var index = _.findIndex(vm.pendingTasks, {id: id});
        toastr.success(NstSvcTranslation.get(String('You\'ve accepted {0}\'s task').replace('{0}', vm.pendingTasks[index].assignor.fullName)));
        vm.pendingTasks.splice(index, 1);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Something went wrong!'));
      });
    }

    function declineTask(id) {
      NstSvcTaskFactory.respond(id, NST_TASK_STATUS.DECLINE).then(function () {
        var index = _.findIndex(vm.pendingTasks, {id: id});
        toastr.warning(NstSvcTranslation.get(String('You\'ve declined {0}\'s task').replace('{0}', vm.pendingTasks[index].assignor.fullName)));
        vm.pendingTasks.splice(index, 1);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Something went wrong!'));
      });
    }

    /*
     * Events
     */
    eventReferences.push($rootScope.$on('task-created', function () {
      vm.taskSetting.limit = 8;
      vm.taskSetting.skip = 0;
      loadTasks();
    }));

    eventReferences.push($rootScope.$on('scroll-reached-bottom', function () {
      loadMoreTasks();
    }));

    eventReferences.push($rootScope.$on('task-updated', function (event, id) {
      replaceTask(id);
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
