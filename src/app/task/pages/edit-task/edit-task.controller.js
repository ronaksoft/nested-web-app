(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('EditTaskController', EditTaskController);

  /** @ngInject */
  function EditTaskController($q, $, $timeout, $scope, $state, $rootScope, $stateParams,
                              NstSvcAuth, _, toastr, NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS,
                              NstUtility, NstSvcTaskFactory, NstSvcTaskUtility, NST_TASK_STATUS) {
    var vm = this;
    // var eventReferences = [];

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    vm.taskStatuses = NST_TASK_STATUS;
    vm.taskId = '';
    vm.mode = 'edit';
    vm.editMode = true;
    vm.onlyComments = true;
    vm.loading = true;
    vm.firstLoading = true;
    vm.activityCount = 0;
    vm.activityPopover = false;

    vm.isOpenBinder = false;
    vm.showMoreOption = false;
    vm.datePickerconfig = {
      allowFuture: true
    };

    vm.backDropClick = backDropClick;
    vm.openBinder = openBinder;
    vm.bindRow = bindRow;
    vm.editTask = editTask;
    vm.initiateFocus = initiateFocus;

    function openBinder() {
      vm.isOpenBinder = !vm.isOpenBinder;
    }

    function initiateFocus() {
      vm.assigneeFocus = false;
      vm.dueDateFocus = false;
      vm.descriptionFocus = false;
      vm.todoFocus = false;
      vm.attachmentFocus = false;
      vm.labelFocus = false;
      vm.watcherFocus = false;
    }
    initiateFocus();

    function bindRow(key) {
      vm[key] = true;
      vm.isOpenBinder = false;
      initiateFocus();
      try {
        var newKey = key.replace('enable', '').toLowerCase(),
            firstChar = newKey[0],
            firstCharLowerCase = newKey[0].toLowerCase();
        newKey = newKey.replace(firstChar, firstCharLowerCase);
        vm[newKey + 'Focus'] = true;
      } catch (e) {

      }
    }

    var gotoTask = null;

    function editTask(id) {
      $scope.$dismiss();
      gotoTask = id;
    }

    //

    vm.model = {
      isRelated: false,
      relatedTask: null,
      childTasks: [],
      titleLengthLimit: 64,
      assignor: null,
      status: null,
      progress: -1,
      counters: {},
      title: '',
      assignees: [],
      dueDateText: null,
      dueDate: null,
      hasDueTime: false,
      description: '',
      todos: [],
      attachments: [],
      watchers: [],
      labels: [],
      access: null
    };

    function backItUp() {
      vm.modelBackUp = $.extend(true, {}, vm.model);
      if (vm.modelBackUp.attachments.hasOwnProperty('init')) {
        vm.modelBackUp.attachments = vm.modelBackUp.attachments.data;
      }
      if (vm.modelBackUp.assignees.hasOwnProperty('init')) {
        vm.modelBackUp.assignees = vm.modelBackUp.assignees.data;
      }
      if (vm.modelBackUp.watchers.hasOwnProperty('init')) {
        vm.modelBackUp.watchers = vm.modelBackUp.watchers.data;
      }
      if (vm.modelBackUp.labels.hasOwnProperty('init')) {
        vm.modelBackUp.labels = vm.modelBackUp.labels.data;
      }
    }

    backItUp();

    vm.taskActivities = [];

    vm.title = '';
    vm.titleFocus = false;
    vm.titlePlaceholder = NstSvcTranslation.get('Enter a Task Title');
    vm.updateTitle = updateTitle;

    vm.assigneeFocusTrigger = 0;
    vm.assigneeTodoTrigger = 0;
    vm.enterSubjectTask = function () {
      vm.assigneeFocus = true;
      vm.assigneeFocusTrigger++;
    };
    vm.enterDescriptionTask = function () {
      vm.todoFocus = true;
      vm.assigneeTodoTrigger++;
    };

    vm.assignor = null;
    vm.commentSent = function () {
      // console.log('comment sent');
    };

    vm.assigneeIcon = 'no-assignee';
    vm.assigneePlaceholder = NstSvcTranslation.get('Add assignee or candidates');
    vm.assigneeChanged = false;
    vm.assigneeLoading = false;
    vm.removeAssignees = removeAssignees;
    vm.executeAssigneeUpdate = executeAssigneeUpdate;
    vm.assigneeKeyDown = assigneeKeyDown;

    vm.dueDatePlaceholder = NstSvcTranslation.get('+ Set a due time (optional)');
    vm.removeDueDate = removeDueDate;
    vm.enableDue = false;

    vm.descriptionPlaceholder = NstSvcTranslation.get('+ Add a Description...');
    vm.enableDescription = false;
    vm.updateDescription = updateDescription;

    vm.todoPlaceholder = NstSvcTranslation.get('+ Add a to-do');
    vm.removeTodos = removeTodos;
    vm.enableTodo = false;
    vm.updateTodo = updateTodo;
    vm.checkTodo = checkTodo;

    vm.removeAttachments = removeAttachments;
    vm.enableAttachment = false;

    vm.watcherPlaceholder = NstSvcTranslation.get('Add peoples who wants to follow task...');
    vm.removeWatchers = removeWatchers;
    vm.enableWatcher = false;

    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');
    vm.removeLabels = removeLabels;
    vm.enableLabel = false;

    vm.isDisabled = isDisabled;

    vm.getTaskIcon = NstSvcTaskUtility.getTaskIcon;

    var dataInit = false;
    var isUpdated = false;

    (function () {
      vm.taskId = $stateParams.taskId;
      getTask(vm.taskId);
    })();

    // vm.isInCandidateMode = false;

    function importTaskData(task) {
      vm.model.status = task.status;
      vm.model.progress = task.progress;

      vm.model.title = task.title;
      vm.model.assignor = task.assignor;
      vm.model.counters = task.counters;
      vm.model.access = task.access;

      if (task.assignee !== undefined) {
        vm.model.assignees = {
          init: true,
          data: [task.assignee]
        };
      } else if (task.candidates !== undefined) {
        vm.model.assignees = {
          init: true,
          data: task.candidates
        };
        // vm.isInCandidateMode = true;
      }

      if (task.dueDate !== undefined && task.dueDate !== 0) {
        vm.model.dueDate = task.dueDate / 1000;
        vm.model.hasDueTime = task.hasDueTime;
        // vm.enableDue = true;
      } else {
        vm.model.dueDate = null;
      }

      if (task.description !== undefined && _.trim(task.description).length > 0) {
        vm.model.description = task.description;
        vm.enableDescription = true;
      }

      if (task.todos !== undefined && task.todos.length > 0) {
        vm.model.todos = task.todos;
        vm.enableTodo = true;
      }

      if (task.attachments !== undefined) {
        vm.model.attachments = {
          init: true,
          data: task.attachments
        };
        vm.enableAttachment = true;
      }

      if (task.watchers !== undefined) {
        vm.model.watchers = {
          init: true,
          data: task.watchers
        };
        vm.enableWatcher = true;
      }

      if (task.labels !== undefined && task.labels.length !== 0) {
        vm.model.labels = {
          init: true,
          data: task.labels
        };
        vm.enableLabel = true;
      }

      if (task.relatedTask !== undefined) {
        vm.model.isRelated = true;
        vm.model.relatedTask = task.relatedTask;
      }

      if (task.childTasks !== undefined) {
        vm.model.childTasks = task.childTasks;
      }
    }

    function getTask(id) {
      NstSvcTaskFactory.get(id, function (task) {
        importTaskData(task);
        vm.loading = false;
      }).then(function (task) {
        vm.loading = false;
        importTaskData(task);
        $timeout(function () {
          dataInit = true;
          vm.loading = false;
          backItUp();
        }, 100);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("You don't have access to this task or it's been removed!"));
        $scope.$dismiss();
      });
    }

    vm.createRelatedTask = createRelatedTask;
    vm.setState = setState;
    vm.remove = remove;

    function removeAssignees() {
      vm.removeAssigneeItems.call();
      // toastr.success('fd')
    }

    function getAssigneeIcon(data) {
      if (data.length === 0) {
        vm.assigneeIcon = 'no-assignee';
      } else if (data.length === 1) {
        vm.assigneeIcon = data[0];
      } else if (data.length > 1) {
        vm.assigneeIcon = 'candidate';
      }
    }

    $scope.$watch(function () {
      return vm.model.assignees;
    }, function (newVal) {
      getAssigneeIcon(newVal);
    }, true);

    function removeDueDate() {
      vm.model.dueDate = null;
    }

    function removeTodos() {
      initiateFocus();
      if (vm.model.todos.length === 0) {
        vm.enableTodo = false;
      } else {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Remove All To-Dos'),
          body: NstSvcTranslation.get('Are you sure?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          vm.removeTodoItems.call();
          vm.enableTodo = false;
        });
      }
    }

    function removeAttachments() {
      initiateFocus();
      if (vm.model.attachments.length === 0) {
        vm.enableAttachment = false;
      } else {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Remove All Attachments'),
          body: NstSvcTranslation.get('Are you sure?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          vm.removeAttachmentItems.call();
          vm.enableAttachment = false;
        });
      }
    }

    function removeWatchers() {
      initiateFocus();
      if (vm.model.watchers.length === 0) {
        vm.enableWatcher = false;
      } else {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Remove All Watchers'),
          body: NstSvcTranslation.get('Are you sure?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          vm.removeWatcherItems.call();
          vm.enableWatcher = false;
        });
      }
    }

    function removeLabels() {
      initiateFocus();
      if (vm.model.labels.length === 0) {
        vm.enableLabel = false;
      } else {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Remove All Labels'),
          body: NstSvcTranslation.get('Are you sure?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          vm.removeLabelItems.call();
          vm.enableLabel = false;
        });
      }
    }

    function isDisabled() {
      var response = NstSvcTaskUtility.validateTask(vm.model);
      return !response.valid;
    }

    function backDropClick() {
      $scope.$dismiss();
    }

    var taskUpdateModel = {
      title: null,
      description: null,
      dueDate: null,
      hasDueTime: null
    };

    var updateDebouncer = _.debounce(updateTask, 1000);

    function updateTitle(text) {
      if (vm.modelBackUp.title === text || !vm.model.access.updateTask) {
        return;
      }
      taskUpdateModel.title = text;
      updateDebouncer.call();
    }

    function updateDescription(text) {
      if (vm.modelBackUp.description === text || !vm.model.access.updateTask) {
        return;
      }
      taskUpdateModel.description = text;
      updateDebouncer.call();
    }

    function updateDueDate(date, hasDueTime) {
      if ((vm.modelBackUp.dueDate === date && vm.modelBackUp.hasDueTime === hasDueTime) || !vm.model.access.updateTask) {
        return;
      }
      if (date === null) {
        taskUpdateModel.dueDate = 0;
      } else {
        taskUpdateModel.dueDate = date;
        taskUpdateModel.hasDueTime = hasDueTime;
      }
      updateDebouncer.call();
    }

    $scope.$watch(function () {
      return {
        time: vm.model.dueDate,
        hasTime: vm.model.hasDueTime
      };
    }, function (newVal) {
      if (dataInit) {
        updateDueDate(newVal.time, newVal.hasTime);
      }
    }, true);

    function updateTask() {
      NstSvcTaskFactory.taskUpdate(vm.taskId, taskUpdateModel.title, taskUpdateModel.description, (taskUpdateModel.dueDate === null ? null : taskUpdateModel.dueDate * 1000), taskUpdateModel.hasDueTime).then(function () {
        backItUp();
        isUpdated = true;
      })/*.catch(function (error) {
        console.log(error);
      })*/;
    }

    function getNormalValue(data) {
      if (data.hasOwnProperty('data')) {
        return data.data;
      }
      return data;
    }

    $scope.$watch(function () {
      return vm.model.assignees;
    }, function (newVal) {
      if (dataInit) {
        updateAssignee(getNormalValue(newVal));
      }
    }, true);

    function getCommaSeparate(items) {
      return _.map(items, function (item) {
        return item.id;
      }).join(',');
    }

    function updateAssignee(assignees) {
      if (!vm.model.access.updateTask) {
        return;
      }
      var oldData = getNormalValue(vm.modelBackUp.assignees);
      var newItems = _.differenceBy(assignees, oldData, 'id');
      var removedItems = _.differenceBy(oldData, assignees, 'id');
      vm.assigneeChanged = (newItems.length > 0 || removedItems.length > 0) && assignees.length > 0;
    }

    function executeAssigneeUpdate(action) {
      if (vm.assigneeLoading) {
        return;
      }
      if (action === 'abort') {
        vm.model.assignees = vm.modelBackUp.assignees.slice(0);
        vm.assigneeFocus = false;
      } else if (action === 'confirm') {
        vm.assigneeLoading = true;
        NstSvcTaskFactory.updateAssignee(vm.taskId, getCommaSeparate(vm.model.assignees)).then(function () {
          vm.modelBackUp.assignees = vm.model.assignees.slice(0);
          isUpdated = true;
          vm.assigneeFocus = false;
          vm.assigneeChanged = false;
          vm.assigneeLoading = false;
        });
      }
    }

    function assigneeKeyDown(keyCode) {
      if (keyCode === 27) {
        executeAssigneeUpdate('abort');
      } else if (keyCode === 13) {
        executeAssigneeUpdate('confirm');
      }
    }

    $scope.$watch(function () {
      return vm.model.todos;
    }, function (newVal) {
      if (dataInit && vm.model.todos.length !== vm.modelBackUp.todos.length) {
        updateTodos(getNormalValue(newVal));
      }
    }, true);

    function updateTodos(todos) {
      var oldData = getNormalValue(vm.modelBackUp.todos);
      var newItems = _.differenceBy(todos, oldData, 'id');
      var removedItems = _.differenceBy(oldData, todos, 'id');
      var promises = [];

      if (newItems.length > 0) {
        _.forEach(newItems, function (item) {
          promises.push(NstSvcTaskFactory.addTodo(vm.taskId, item.text, item.weight));
        });
      }

      if (removedItems.length > 0) {
        promises.push(NstSvcTaskFactory.removeTodo(vm.taskId, getCommaSeparate(removedItems)));
      }

      if (newItems.length > 0 || removedItems.length > 0) {
        $q.all(promises).then(function () {
          vm.modelBackUp.todos = vm.model.todos.slice(0);
          isUpdated = true;
        });
      }
    }

    function updateTodo(index, data) {
      if (vm.modelBackUp.todos[index].text === data.text) {
        return;
      }
      NstSvcTaskFactory.updateTodo(vm.taskId, data.id, data.checked, data.text, data.weight).then(function () {
        vm.modelBackUp.todos[index] = data;
        isUpdated = true;
      });
    }

    function checkTodo(index, data) {
      if (vm.modelBackUp.todos[index].checked === data.checked) {
        return;
      }
      NstSvcTaskFactory.updateTodo(vm.taskId, data.id, data.checked).then(function () {
        vm.modelBackUp.todos[index].checked = data.checked;
        isUpdated = true;
      });
    }

    $scope.$watch(function () {
      return vm.model.attachments;
    }, function (newVal) {
      if (dataInit) {
        updateAttachments(getNormalValue(newVal));
      }
    }, true);

    function updateAttachments(attachments) {
      var oldData = getNormalValue(vm.modelBackUp.attachments);
      var newItems = _.differenceBy(attachments, oldData, 'id');
      //to ensure attachments are uploaded completely
      newItems = _.filter(newItems, function (item) {
        return item.status === NST_ATTACHMENT_STATUS.ATTACHED;
      });
      var removedItems = _.differenceBy(oldData, attachments, 'id');

      if (newItems.length > 0) {
        NstSvcTaskFactory.addAttachment(vm.taskId, getCommaSeparate(newItems)).then(function () {
          vm.modelBackUp.attachments.push.apply(vm.modelBackUp.attachments, newItems);
          isUpdated = true;
        });
      }

      if (removedItems.length > 0) {
        NstSvcTaskFactory.removeAttachment(vm.taskId, getCommaSeparate(removedItems)).then(function () {
          _.forEach(removedItems, function (item) {
            var index = _.findIndex(vm.modelBackUp.attachments, {
              'id': item.id
            });
            if (index > -1) {
              vm.modelBackUp.attachments.splice(index, 1);
            }
          });
          isUpdated = true;
        });
      }
    }

    $scope.$watch(function () {
      return vm.model.watchers;
    }, function (newVal) {
      if (dataInit) {
        updateWatcher(getNormalValue(newVal));
      }
    }, true);

    function updateWatcher(watchers) {
      var oldData = getNormalValue(vm.modelBackUp.watchers);
      var newItems = _.differenceBy(watchers, oldData, 'id');
      var removedItems = _.differenceBy(oldData, watchers, 'id');
      var promises = [];

      if (newItems.length > 0) {
        promises.push(NstSvcTaskFactory.addWatcher(vm.taskId, getCommaSeparate(newItems)));
      }

      if (removedItems.length > 0) {
        promises.push(NstSvcTaskFactory.removeWatcher(vm.taskId, getCommaSeparate(removedItems)));
      }

      if (newItems.length > 0 || removedItems.length > 0) {
        $q.all(promises).then(function () {
          vm.modelBackUp.watchers = vm.model.watchers.slice(0);
          isUpdated = true;
          if (_.findIndex(removedItems, {id: vm.user.id}) > -1) {
            $scope.$dismiss();
          }
        });
      }
    }

    $scope.$watch(function () {
      return vm.model.labels;
    }, function (newVal) {
      if (dataInit) {
        updateLabels(getNormalValue(newVal));
      }
    }, true);

    function updateLabels(labels) {
      var oldData = getNormalValue(vm.modelBackUp.labels);
      var newItems = _.differenceBy(labels, oldData, 'id');
      var removedItems = _.differenceBy(oldData, labels, 'id');
      var promises = [];

      if (newItems.length > 0) {
        promises.push(NstSvcTaskFactory.addLabel(vm.taskId, getCommaSeparate(newItems)));
      }

      if (removedItems.length > 0) {
        promises.push(NstSvcTaskFactory.removeLabel(vm.taskId, getCommaSeparate(removedItems)));
      }

      if (newItems.length > 0 || removedItems.length > 0) {
        $q.all(promises).then(function () {
          vm.modelBackUp.labels = vm.model.labels.slice(0);
          isUpdated = true;
        });
      }
    }

    function createRelatedTask() {
      $rootScope.$broadcast('create-related-task', vm.taskId);
      $scope.$dismiss();
    }

    function setState(state) {
      var status;
      switch (state) {
        case NST_TASK_STATUS.STATE_COMPLETE:
          status = NST_TASK_STATUS.COMPLETED;
          break;
        case NST_TASK_STATUS.STATE_HOLD:
          status = NST_TASK_STATUS.HOLD;
          break;
        default:
          status = null;
          break;
      }
      if (vm.modelBackUp.status === status) {
        return;
      }
      NstSvcTaskFactory.setState(vm.taskId, state).then(function (data) {
        vm.model.status = data.new_status;
        vm.modelBackUp.status = data.new_status;
        isUpdated = true;
      });
    }

    function remove() {
      NstSvcTaskUtility.promptModal({
        title: NstSvcTranslation.get('Remove Task'),
        body: NstSvcTranslation.get('Are you sure?'),
        confirmText: NstSvcTranslation.get('Yes'),
        confirmColor: 'red',
        cancelText: NstSvcTranslation.get('Cancel')
      }).then(function () {
        NstSvcTaskFactory.remove(vm.taskId).then(function () {
          toastr.success(NstSvcTranslation.get('Task {name} removed successfully').replace('{name}', '"' + vm.model.title + '"'));
          isUpdated = true;
          $scope.$dismiss();
        });
      });
    }

    var focusInit = true;
    $scope.$watch(function () {
      return {
        titleFocus: vm.titleFocus,
        assigneeFocus: vm.assigneeFocus,
        dueDateFocus: vm.dueDateFocus,
        descriptionFocus: vm.descriptionFocus,
        todoFocus: vm.todoFocus,
        attachmentFocus: vm.attachmentFocus,
        watcherFocus: vm.watcherFocus,
        labelFocus: vm.labelFocus
      };
    }, function (newVal, oldVal) {
      if (focusInit) {
        $timeout(function () {
          focusInit = false;
          handleFocus(newVal, oldVal);
        });
      } else {
        focusInit = true;
      }
    }, true);

    function handleFocus(newVal, oldVal) {
      for (var i in newVal) {
        if (newVal[i] === oldVal[i]) {
          vm[i] = false;
        }
      }
    }

    $scope.$on('$destroy', function () {
      if (isUpdated) {
        $rootScope.$broadcast('task-updated', vm.taskId);
      }
      if (gotoTask !== null) {
        $state.go('app.task.edit', {
          taskId: gotoTask
        }, {
          notify: false
        });
      }
    });
  }
})();
