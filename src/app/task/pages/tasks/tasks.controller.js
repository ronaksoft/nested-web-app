(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TasksController', TasksController);

  function TasksController($rootScope, $q, $window, $scope, _, $state, NstSvcTaskFactory, NST_TASK_STATUS, $uibModal, NstSvcTaskActivityFactory,
                           NstSvcTaskUtility, $timeout, toastr, NstSvcTranslation, NstSvcAuth, NstSvcKeyFactory, NST_CUSTOM_FILTER, NST_TASK_EVENT_ACTION) {
    var vm = this;
    var eventReferences = [];
    var customFilters = [];

    vm.customFilterId = '';
    vm.customFilterName = '';
    vm.customFilterItems = '';
    vm.customFilterPopover = false;
    vm.openCustomFilterModal = openCustomFilterModal;
    vm.removeCustomFilter = removeCustomFilter;
    vm.openContacts = openContacts;

    vm.tasks = [];
    vm.loading = true;
    vm.firstStart = true;
    vm.firstTimeLoading = true;
    vm.taskSetting = {
      limit: 8,
      skip: 0
    };

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    (function () {
      if ($state.current.name === 'app.task.custom_filter' && $state.params && $state.params.id) {
        loadCustomFilteredTasks();
        eventReferences.push($rootScope.$on('task-custom-filter-updated', function () {
          loadCustomFilteredTasks();
        }));
      }
    })();

    function loadCustomFilteredTasks() {
      vm.taskSetting.skip = 0;
      vm.tasks = [];
      vm.customFilterId = parseInt($state.params.id);
      getCustomFilters(true).then(function (data) {
        customFilters = data;
        var index = getFilterIndex();
        if (index > -1) {
          vm.customFilterName = customFilters[index].name;
          vm.customFilterItems = customFilters[index].filters;
          loadTasks();
        }
      });
    }

    function openContacts($event) {
      $state.go('app.contacts', {}, {
        notify: false
      });
      $event.preventDefault();
    }

    function getFilterIndex() {
      return _.findIndex(customFilters, {id: vm.customFilterId});
    }

    function getCustomFilters(cache) {
      return NstSvcKeyFactory.get(NST_CUSTOM_FILTER.KEY_NAME, cache).then(function (result) {
        if (result) {
          return JSON.parse(result);
        }
        return [];
      });
    }

    function openCustomFilterModal(id) {
      vm.customFilterPopover = false;
      $rootScope.$broadcast('open-task-custom-filter', {id: id});
    }

    function removeCustomFilter(id) {
      vm.customFilterPopover = false;
      $uibModal.open({
        animation: false,
        templateUrl: 'app/label/partials/label-confirm-modal.html',
        controller: 'labelConfirmModalController',
        controllerAs: 'confirmModal',
        size: 'sm',
        resolve: {
          modalSetting: {
            title: NstSvcTranslation.get('Delete custom filter'),
            body: NstSvcTranslation.get('Are you sure you want to delete this custom filter?'),
            confirmText: NstSvcTranslation.get('Delete'),
            confirmColor: 'red',
            cancelText: NstSvcTranslation.get('Cancel')
          }
        }
      }).result.then(function () {
        var tempList = [];
        getCustomFilters(false).then(function (data) {
          tempList = data;
          var index = _.findIndex(tempList, {id: id});
          if (index > -1) {
            tempList.splice(index, 1);
            return NstSvcKeyFactory.set(NST_CUSTOM_FILTER.KEY_NAME, JSON.stringify(tempList)).then(function () {
              toastr.success(NstSvcTranslation.get('Custom filter successfully deleted'));
              $rootScope.$broadcast('task-custom-filter-updated');
              $state.go('app.task.glance');
            }).catch(function () {
              toastr.error(NstSvcTranslation.get('Something went wrong!'));
            });
          } else {
            toastr.warning(NstSvcTranslation.get('Custom filter not found!'));
          }
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Something went wrong!'));
        });
      });
    }

    vm.isGlancePage = false;
    vm.isAssignedToMePage = false;
    vm.isCreatedByMePage = false;
    vm.isWatchlistPage = false;
    vm.isCustomFilterPage = false;
    vm.editTask = editTask;
    vm.acceptTask = acceptTask;
    vm.declineTask = declineTask;
    vm.statuses = NST_TASK_STATUS;
    vm.getTaskIcon = NstSvcTaskUtility.getTaskIcon;

    vm.overDueTasks = [];
    vm.pendingTasks = [];

    setLocationFlag();
    if (!vm.isCustomFilterPage) {
      loadTasks();
    }
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

    function mergeList(oldList, newList) {
      var newItems = _.differenceBy(newList, oldList, 'id');
      var removedItems = _.differenceBy(oldList, newList, 'id');

      _.forEach(removedItems, function (item) {
        var index = _.findIndex(oldList, {
          'id': item.id
        });
        if (index > -1) {
          oldList.splice(index, 1);
        }
      });

      oldList.unshift.apply(oldList, newItems);
    }

    function replaceTask(id) {
      var index = _.findIndex(vm.tasks, {id: id});
      NstSvcTaskFactory.get(id).then(function (task) {
        if (vm.isWatchlistPage && _.findIndex(task.watchers, {id: vm.user.id}) > -1) {
          vm.tasks.splice(index, 1);
        }
        if (vm.isAssignedToMePage && task.assignee.id !== vm.user.id) {
          vm.tasks.splice(index, 1);
        } else {
          vm.tasks[index] = task;
        }
      }).catch(function () {
        vm.tasks.splice(index, 1);
        if (vm.isGlancePage) {
          var overDueIndex = _.findIndex(vm.overDueTasks, {id: id});
          if (overDueIndex > -1) {
            vm.overDueTasks.splice(overDueIndex, 1);
          }
          var pendingIndex = _.findIndex(vm.pendingTasks, {id: id});
          if (pendingIndex > -1) {
            vm.pendingTasks.splice(pendingIndex, 1);
          }
        }
      });
    }

    function getOverdueTasks() {
      NstSvcTaskFactory.getByFilter({
        filter: NST_TASK_STATUS.ASSIGNED_TO_ME,
        statusFilter: NST_TASK_STATUS.OVERDUE
      }, function (tasks) {
        vm.overDueTasks = tasks;
      }).then(function (tasks) {
        vm.overDueTasks = tasks;
      });
    }

    function getPendingTasks() {
      NstSvcTaskFactory.getByFilter({
        filter: NST_TASK_STATUS.CANDIDATE,
        statusFilter: NST_TASK_STATUS.NO_ASSIGNED
      }, function (tasks) {
        mergeList(vm.pendingTasks, tasks);
      }).then(function (tasks) {
        mergeList(vm.pendingTasks, tasks);
      });
    }

    function importCachedTasks(tasks) {
      appendTasks(tasks);
    }

    function getTasks() {
      vm.loading = true;
      var promise;
      var isCompleted = false;
      if ($state.params && $state.params.filter === 'completed') {
        isCompleted = true;
      }
      var statusFilter = [];
      var importFromCache = undefined;
      if (vm.taskSetting.skip === 0) {
        importFromCache = importCachedTasks;
      }
      if (vm.isGlancePage) {
        promise = NstSvcTaskFactory.getByFilter({
          filter: NST_TASK_STATUS.GLANCE,
          statusFilter: null,
          skip: vm.taskSetting.skip,
          limit: vm.taskSetting.limit
        }, importFromCache);
      } else if (vm.isAssignedToMePage) {
        if (isCompleted) {
          statusFilter.push(NST_TASK_STATUS.COMPLETED);
          statusFilter.push(NST_TASK_STATUS.FAILED);
        } else {
          statusFilter.push(NST_TASK_STATUS.ASSIGNED);
          statusFilter.push(NST_TASK_STATUS.HOLD);
          statusFilter.push(NST_TASK_STATUS.OVERDUE);
        }
        promise = NstSvcTaskFactory.getByFilter({
          filter: NST_TASK_STATUS.ASSIGNED_TO_ME,
          statusFilter: statusFilter.join(','),
          skip: vm.taskSetting.skip,
          limit: vm.taskSetting.limit
        }, importFromCache);
      } else if (vm.isCreatedByMePage) {
        if (isCompleted) {
          statusFilter.push(NST_TASK_STATUS.COMPLETED);
          statusFilter.push(NST_TASK_STATUS.FAILED);
        } else {
          statusFilter.push(NST_TASK_STATUS.NO_ASSIGNED);
          statusFilter.push(NST_TASK_STATUS.ASSIGNED);
          statusFilter.push(NST_TASK_STATUS.CANCELED);
          statusFilter.push(NST_TASK_STATUS.REJECTED);
          statusFilter.push(NST_TASK_STATUS.HOLD);
          statusFilter.push(NST_TASK_STATUS.OVERDUE);
        }
        promise = NstSvcTaskFactory.getByFilter({
          filter: NST_TASK_STATUS.CREATED_BY_ME,
          statusFilter: statusFilter.join(','),
          skip: vm.taskSetting.skip,
          limit: vm.taskSetting.limit
        }, importFromCache);
      } else if (vm.isWatchlistPage) {
        if (isCompleted) {
          statusFilter.push(NST_TASK_STATUS.COMPLETED);
          statusFilter.push(NST_TASK_STATUS.FAILED);
        } else {
          statusFilter.push(NST_TASK_STATUS.NO_ASSIGNED);
          statusFilter.push(NST_TASK_STATUS.ASSIGNED);
          statusFilter.push(NST_TASK_STATUS.CANCELED);
          statusFilter.push(NST_TASK_STATUS.REJECTED);
          statusFilter.push(NST_TASK_STATUS.HOLD);
          statusFilter.push(NST_TASK_STATUS.OVERDUE);
        }
        promise = NstSvcTaskFactory.getByFilter({
          filter: NST_TASK_STATUS.WATCHED,
          statusFilter: statusFilter.join(','),
          skip: vm.taskSetting.skip,
          limit: vm.taskSetting.limit
        }, importFromCache);
      } else if (vm.isCustomFilterPage) {
        var params = getCustomFilterParams(vm.customFilterItems);
        params = _.merge(params, {
          skip: vm.taskSetting.skip,
          limit: vm.taskSetting.limit
        });
        promise = NstSvcTaskFactory.getByCustomFilter(params, importCachedTasks);
      }

      promise.then(function (tasks) {
        vm.reachedTheEnd = tasks.length < vm.taskSetting.limit;
      }).catch(function () {

      }).finally(function () {
        vm.loading = false;
      });

      return promise;
    }

    function getNormCommaSeparated(str) {
      str = str.split(',');
      str = _.filter(_.map(str, function (item) {
        return _.trim(item);
      }), function (item) {
        return item.length > 1;
      });
      return str.join(',');
    }

    function getCustomFilterParams(filters) {
      var params = {};
      var statusFilter = [];
      for (var i in filters) {
        switch (filters[i].con) {
          case NST_CUSTOM_FILTER.CONDITION_STATUS:
            statusFilter = [];
            filters[i].val.split(',').forEach(function(status) {
              if (status === NST_CUSTOM_FILTER.STATUS_OVERDUE) {
                statusFilter.push(NST_TASK_STATUS.OVERDUE);
              } else if (status === NST_CUSTOM_FILTER.STATUS_HOLD) {
                statusFilter.push(NST_TASK_STATUS.HOLD);
              } else {
                statusFilter.push(NST_TASK_STATUS.NO_ASSIGNED);
                statusFilter.push(NST_TASK_STATUS.ASSIGNED);
              }
            });
            params.status_filter = statusFilter.join(',');
            break;
          case NST_CUSTOM_FILTER.CONDITION_ASSIGNOR:
            params.assignor_id = getNormCommaSeparated(filters[i].val);
            break;
          case NST_CUSTOM_FILTER.CONDITION_ASSIGNEE:
            params.assignee_id = getNormCommaSeparated(filters[i].val);
            break;
          case NST_CUSTOM_FILTER.CONDITION_LABEL:
            params.label_title = getNormCommaSeparated(filters[i].val);
            params['label.logic'] = filters[i].eq === NST_CUSTOM_FILTER.LOGIC_AND ? 'and' : 'or';
            break;
          case NST_CUSTOM_FILTER.CONDITION_KEYWORD:
            params.keyword = filters[i].val;
            break;
          case NST_CUSTOM_FILTER.CONDITION_DUE_TIME:
            params.due_data_until = filters[i].val;
            break;
        }
      }
      return params;
    }

    function appendTasks(tasks) {
      var items = _.differenceBy(tasks, vm.tasks, 'id');
      vm.tasks.push.apply(vm.tasks, items);
    }

    function fillThePage() {
      if (vm.firstTimeLoading && !vm.reachedTheEnd) {
        $timeout(function () {
          if (!isPageFilled()) {
            loadMoreTasks(true).then(function () {
              fillThePage();
            }).catch(function () {
              vm.firstTimeLoading = false;
            });
          } else {
            vm.firstTimeLoading = false;
          }
        }, 100);
      } else {
        vm.firstTimeLoading = false;
      }
    }

    function loadTasks() {
      getTasks().then(function (tasks) {
        mergeList(vm.tasks, tasks);
        // vm.firstTimeLoading = false;
        vm.taskSetting.skip += vm.taskSetting.limit;
        // to full fill page at first loading
        fillThePage();
      });
    }

    function loadMoreTasks(force) {
      if ((vm.loading || vm.reachedTheEnd) && force !== true) {
        return $q.resolve();
      }
      var deferred = $q.defer();
      getTasks().then(function (tasks) {
        appendTasks(tasks);
        vm.taskSetting.skip += vm.taskSetting.limit;
        deferred.resolve();
      }).catch(function () {
        deferred.reject();
      });
      return deferred.promise;
    }

    function isPageFilled() {
      var taskContainer = angular.element('#task-container');
      return !(window.innerHeight > taskContainer.offset().top + taskContainer.height());
    }

    function editTask(id, callbackUrl) {
      if (callbackUrl) {
        $rootScope.taskCallbackUrl = callbackUrl;
      }
      $state.go('app.task.edit', {
        taskId: id
      }, {
        notify: false
      });
    }

    function acceptTask(id) {
      NstSvcTaskFactory.respond(id, NST_TASK_STATUS.ACCEPT).then(function () {
        var index = _.findIndex(vm.pendingTasks, {id: id});
        toastr.success(NstSvcTranslation.get('Youve accepted {0}s task').replace('{0}', vm.pendingTasks[index].assignor.fullName));
        vm.pendingTasks.splice(index, 1);
        editTask(id);
      }).catch(function (err) {

        if (err.code === 1) {
          var pendingIndex = _.findIndex(vm.pendingTasks, {id: id});
          if (pendingIndex > -1) {
            vm.pendingTasks.splice(pendingIndex, 1);
          }
          toastr.error(NstSvcTranslation.get('Task already assigned.'));
        } else {
          toastr.error(NstSvcTranslation.get('Something went wrong!'));
        }
      });
    }

    function declineTask(id) {
      NstSvcTaskFactory.respond(id, NST_TASK_STATUS.DECLINE).then(function () {
        var index = _.findIndex(vm.pendingTasks, {id: id});
        toastr.warning(NstSvcTranslation.get('Youve declined {0}s task').replace('{0}', vm.pendingTasks[index].assignor.fullName));
        vm.pendingTasks.splice(index, 1);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Something went wrong!'));
      });
    }

    /*
     * Events
     */
    eventReferences.push($rootScope.$on('task-created', function (event, data) {
      $state.go('app.task.created_by_me');
      $timeout(function () {
        editTask(data.id, data.callbackUrl);
      });
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

    // update with sync-t section
    var toBeUpdatedBySyncItems = [];
    var syncUpdateThrottle = _.throttle(syncUpdate, 512);

    function syncUpdate() {
      toBeUpdatedBySyncItems = _.uniq(toBeUpdatedBySyncItems);
      var taskItems = _.intersectionBy(_.map(toBeUpdatedBySyncItems, function (item) {
        return {
          id: item
        };
      }), vm.tasks, 'id');
      _.forEach(taskItems, function (item) {
        NstSvcTaskFactory.get(item.id).then(function (task) {
          var index = _.findIndex(vm.tasks, {id: task.id});
          vm.tasks[index] = task;
        });
      });
      toBeUpdatedBySyncItems = [];
    }

    eventReferences.push($rootScope.$on(NST_TASK_EVENT_ACTION.TASK_ACTIVITY, function (event, data) {
      toBeUpdatedBySyncItems.push(data.taskId);
      syncUpdateThrottle();
      switch (data.type) {
        case NST_TASK_EVENT_ACTION.CREATED:
        case NST_TASK_EVENT_ACTION.ASSIGNEE_CHANGED:
        case NST_TASK_EVENT_ACTION.CANDIDATE_ADDED:
        case NST_TASK_EVENT_ACTION.CANDIDATE_REMOVED:
          getPendingTasks();
          break;
      }
    }));
    // end of update with sync-t section

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
