(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('EditTaskController', EditTaskController);

  /** @ngInject */
  function EditTaskController($q, $, $timeout, $scope, $state, $rootScope, $stateParams, NstSearchQuery,
                              NstSvcAuth, _, toastr, NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS, NstSvcReminderFactory,
                              NstUtility, NstSvcTaskFactory, NstSvcTaskUtility, NST_TASK_STATUS, NST_TASK_EVENT_ACTION) {
    var vm = this;
    var eventReferences = [];

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    vm.taskStatuses = NST_TASK_STATUS;
    vm.taskId = '';
    vm.tempComment = '';
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
    vm.setFocus = setFocus;

    function openBinder() {
      vm.isOpenBinder = !vm.isOpenBinder;
    }

    function setFocus(item) {
      initiateFocus();
      vm[item + 'Focus'] = true;
    }

    function initiateFocus() {
      vm.assigneeFocus = false;
      vm.dueDateFocus = false;
      vm.descriptionFocus = false;
      vm.todoFocus = false;
      vm.attachmentFocus = false;
      vm.labelFocus = false;
      vm.reminderFocus = false;
      vm.watcherFocus = false;
      vm.editorFocus = false;
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
      } catch (e) {}
    }

    var gotoTask = null;

    function editTask(id) {
      $scope.$dismiss();
      gotoTask = id;
    }

    vm.model = {
      isRelated: false,
      relatedTask: null,
      childTasks: [],
      titleLengthLimit: 64,
      descriptionLengthLimit: 511,
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
      editors: [],
      labels: [],
      reminders: [],
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
      if (vm.modelBackUp.editors.hasOwnProperty('init')) {
        vm.modelBackUp.editors = vm.modelBackUp.editors.data;
      }
      if (vm.modelBackUp.labels.hasOwnProperty('init')) {
        vm.modelBackUp.labels = vm.modelBackUp.labels.data;
      }
      if (vm.modelBackUp.reminders.hasOwnProperty('init')) {
        vm.modelBackUp.reminders = vm.modelBackUp.reminders.data;
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

    vm.editorPlaceholder = NstSvcTranslation.get('Add peoples who wants to edit task...');
    vm.removeEditors = removeEditors;
    vm.enableEditor = false;

    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');
    vm.removeLabels = removeLabels;
    vm.enableLabel = false;
    vm.labelClick = labelClick;

    vm.reminderPlaceholder = NstSvcTranslation.get('Add reminders...');
    vm.removeReminders = removeReminders;
    vm.enableReminder = false;
    vm.reminderClick = reminderClick;

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
      if (vm.model.status !== task.status) {
        vm.model.status = task.status;
      }
      if (vm.model.progress !== task.progress) {
        vm.model.progress = task.progress;
      }

      if (vm.model.title !== task.title) {
        vm.model.title = task.title;
      }
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
        if (vm.model.todos.length === 0) {
          vm.model.todos = task.todos;
        } else {
          mergeList(vm.model.todos, task.todos);
        }
        vm.enableTodo = true;
      }

      if (task.attachments !== undefined && task.attachments.length > 0) {
        if (!isIdentical(vm.model.attachments, task.attachments)) {
          vm.model.attachments = {
            init: true,
            data: task.attachments
          };
        }
        vm.enableAttachment = true;
      }

      if (task.watchers !== undefined && task.watchers.length > 0) {
        if (!isIdentical(vm.model.watchers, task.watchers)) {
          vm.model.watchers = {
            init: true,
            data: task.watchers
          };
        }
        vm.enableWatcher = true;
      }

      if (task.editors !== undefined && task.editors.length > 0) {
        if (!isIdentical(vm.model.editors, task.editors)) {
          vm.model.editors = {
            init: true,
            data: task.editors
          };
        }
        vm.enableEditor = true;
      }

      if (task.labels !== undefined && task.labels.length > 0) {
        if (!isIdentical(vm.model.labels, task.labels)) {
          vm.model.labels = {
            init: true,
            data: task.labels
          };
        }
        vm.enableLabel = true;
      }
      if (task.reminders !== undefined && task.reminders.length > 0) {
        if (!isIdentical(vm.model.reminders, task.reminders)) {
          vm.model.reminders = {
            init: true,
            data: task.reminders
          };
        }
        vm.enableReminder = true;
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
      dataInit = false;
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

    function getTaskWithoutCache(id) {
      dataInit = false;
      NstSvcTaskFactory.get(id).then(function (task) {
        importTaskData(task);
        $timeout(function () {
          dataInit = true;
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

    eventReferences.push($scope.$watch(function () {
      return vm.model.assignees;
    }, function (newVal) {
      getAssigneeIcon(newVal);
    }, true));

    function removeDueDate() {
      vm.model.dueDate = 0;
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

    function removeEditors() {
      initiateFocus();
      if (vm.model.editors.length === 0) {
        vm.enableEditor = false;
      } else {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Remove All Editors'),
          body: NstSvcTranslation.get('Are you sure?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          vm.removeEditorItems.call();
          vm.enableEditor = false;
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

    function removeReminders() {
      initiateFocus();
      if (vm.model.reminders.length === 0) {
        vm.enableReminder = false;
      } else {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Remove All Reminders'),
          body: NstSvcTranslation.get('Are you sure?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          vm.removeReminderItems.call();
          vm.enableReminder = false;
        });
      }
    }

    function isDisabled() {
      var response = NstSvcTaskUtility.validateTask(vm.model);
      return !response.valid;
    }

    function backDropClick() {
      if (vm.tempComment.length > 0) {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get("Closing Task"),
          body: NstSvcTranslation.get(
            "By closing this task, you will lose your comment. Are you sure you want to close?"
          ),
          confirmText: NstSvcTranslation.get("Yes"),
          confirmColor: "red",
          cancelText: NstSvcTranslation.get("Cancel")
        })
          .then(function () {
            $scope.$dismiss();
            if ($rootScope.taskCallbackUrl) {
              $timeout(function () {
                var callback = $rootScope.taskCallbackUrl;
                $state.go(callback.name, callback.params);
                delete $rootScope.taskCallbackUrl;
              }, 300);
            }
          })
          .catch(function () {});
        return;
      }
    }

    var taskUpdateModel = {
      title: null,
      description: null,
      dueDate: null,
      hasDueTime: null
    };

    // var updateDebouncer = _.debounce(updateTask, 256);

    function updateTitle(text) {
      if (vm.modelBackUp.title === text || !vm.model.access.updateTask) {
        return;
      }
      taskUpdateModel.title = text;
      updateTask();
    }

    function updateDescription(text) {
      if (vm.modelBackUp.description === text || !vm.model.access.updateTask) {
        return;
      }
      taskUpdateModel.description = text;
      updateTask();
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
      updateTask();
    }

    eventReferences.push($scope.$watch(function () {
      return {
        time: vm.model.dueDate,
        hasTime: vm.model.hasDueTime
      };
    }, function (newVal) {
      if (dataInit) {
        updateDueDate(newVal.time, newVal.hasTime);
      }
    }, true));

    function updateTask() {
      NstSvcTaskFactory.taskUpdate(vm.taskId, taskUpdateModel.title || vm.model.title, taskUpdateModel.description, (taskUpdateModel.dueDate === null ? null : taskUpdateModel.dueDate * 1000), taskUpdateModel.hasDueTime).then(function () {
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

    eventReferences.push($scope.$watch(function () {
      return vm.model.assignees;
    }, function (newVal) {
      if (dataInit) {
        updateAssignee(getNormalValue(newVal));
      }
    }, true));

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
      vm.assigneeChanged = (newItems.length > 0 || removedItems.length > 0);
    }

    function executeAssigneeUpdate(action) {
      if (vm.assigneeLoading) {
        return;
      }
      if (action === 'abort') {
        vm.model.assignees = _.cloneDeep(vm.modelBackUp.assignees);
        vm.assigneeFocus = false;
      } else if (action === 'confirm') {
        if (vm.model.assignees.length === 0) {
          toastr.warning(NstSvcTranslation.get('You must have at least one assignee!'));
          return;
        }
        vm.assigneeLoading = true;
        NstSvcTaskFactory.updateAssignee(vm.taskId, getCommaSeparate(vm.model.assignees)).then(function () {
          vm.modelBackUp.assignees = _.cloneDeep(vm.model.assignees);
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

    eventReferences.push($scope.$watch(function () {
      return vm.model.todos;
    }, function (newVal) {
      if (dataInit && vm.model.todos.length !== vm.modelBackUp.todos.length) {
        updateTodos(getNormalValue(newVal));
      }
    }, true));

    function updateTodos(todos) {
      var oldData = getNormalValue(vm.modelBackUp.todos);
      var newItems = _.differenceBy(todos, oldData, 'id');
      var removedItems = _.differenceBy(oldData, todos, 'id');
      var removePromises = [];

      if (newItems.length > 0) {
        _.forEach(newItems, function (item) {
          NstSvcTaskFactory.addTodo(vm.taskId, item.text, item.weight).then(function (data) {
            var index = _.findIndex(vm.model.todos, {
              'id': item.id
            });
            if (index > -1) {
              vm.model.todos[index].id = data.todo_id;
            }
            vm.modelBackUp.todos = _.cloneDeep(vm.model.todos);
            isUpdated = true;
          });
        });
      }

      if (removedItems.length > 0) {
        removePromises.push(NstSvcTaskFactory.removeTodo(vm.taskId, getCommaSeparate(removedItems)));
        $q.all(removePromises).then(function () {
          vm.modelBackUp.todos = _.cloneDeep(vm.model.todos);
          isUpdated = true;
        });
      }
    }

    function updateTodo(index, data) {
      NstSvcTaskFactory.updateTodo(vm.taskId, data.id, data.checked, data.text, data.weight).then(function () {
        vm.modelBackUp.todos[index] = data;
        isUpdated = true;
      });
    }

    function checkTodo(index, data) {
      NstSvcTaskFactory.updateTodo(vm.taskId, data.id, data.checked).then(function () {
        vm.modelBackUp.todos[index].checked = data.checked;
        isUpdated = true;
      });

      var doneItems = _.filter(vm.model.todos, function (item) {
        return item.checked === true;
      });

      vm.model.progress = Math.ceil((doneItems.length / vm.model.todos.length) * 100);

      if (doneItems.length === vm.model.todos.length) {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Set as Completed'),
          body: NstSvcTranslation.get('All Todos are done, do you want to set this task as Completed?'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'green',
          cancelText: NstSvcTranslation.get('No')
        }).then(function () {
          vm.setState(vm.taskStatuses.STATE_COMPLETE);
        });
      }
    }

    eventReferences.push($scope.$watch(function () {
      return vm.model.attachments;
    }, function (newVal) {
      if (dataInit) {
        updateAttachments(getNormalValue(newVal));
      }
    }, true));

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

    eventReferences.push($scope.$watch(function () {
      return vm.model.watchers;
    }, function (newVal) {
      if (dataInit) {
        updateWatcher(getNormalValue(newVal));
      }
    }, true));

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
          vm.modelBackUp.watchers = _.cloneDeep(vm.model.watchers);
          isUpdated = true;
          if (_.findIndex(removedItems, {id: vm.user.id}) > -1) {
            $scope.$dismiss();
          }
        });
      }
    }

    eventReferences.push($scope.$watch(function () {
      return vm.model.editors;
    }, function (newVal) {
      if (dataInit) {
        updateEditor(getNormalValue(newVal));
      }
    }, true));

    function updateEditor(editors) {
      var oldData = getNormalValue(vm.modelBackUp.editors);
      var newItems = _.differenceBy(editors, oldData, 'id');
      var removedItems = _.differenceBy(oldData, editors, 'id');
      var promises = [];

      if (newItems.length > 0) {
        promises.push(NstSvcTaskFactory.addEditor(vm.taskId, getCommaSeparate(newItems)));
      }

      if (removedItems.length > 0) {
        promises.push(NstSvcTaskFactory.removeEditor(vm.taskId, getCommaSeparate(removedItems)));
      }

      if (newItems.length > 0 || removedItems.length > 0) {
        $q.all(promises).then(function () {
          vm.modelBackUp.editors = _.cloneDeep(vm.model.editors);
          isUpdated = true;
          if (_.findIndex(removedItems, {id: vm.user.id}) > -1) {
            $scope.$dismiss();
          }
        });
      }
    }

    eventReferences.push($scope.$watch(function () {
      return vm.model.labels;
    }, function (newVal) {
      if (dataInit) {
        updateLabels(getNormalValue(newVal));
      }
    }, true));

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
          vm.modelBackUp.labels = _.cloneDeep(vm.model.labels);
          isUpdated = true;
        });
      }
    }

    eventReferences.push($scope.$watch(function () {
      return vm.model.reminders;
    }, function (newVal, oldVal) {
      var reminders = getNormalValue(newVal)
      var oldValReminders = getNormalValue(oldVal)
      if (dataInit && reminders.length !== oldValReminders.length) {
        updateReminders(reminders, oldValReminders);
      }
    }, true));

    function updateReminders(reminders, oldReminders) {
      var oldData = getNormalValue(oldReminders);
      var newItems = _.filter(reminders, function(r) {
        return r.id === undefined;
      });
      var removedItems = _.differenceBy(oldData, reminders, 'id');
      var promises = [];

      _.forEach(newItems, function(reminder) {
        reminder = NstSvcReminderFactory.createRequestObject(reminder);
        var promiseFn = function () {
          var deferred = $q.defer();
          NstSvcTaskFactory.addReminder(vm.taskId, reminder.repeated, reminder.relative, reminder.timestamp, reminder.interval, reminder.days).then(function (response){
            if (!response[0]){
              return
            }
            var ind = _.findIndex(vm.model.reminders, function(r) { return r.id === reminder.id});
            var newReminder = response[0];
            if (ind > -1) {
              vm.model.reminders[ind] = newReminder;
            }
            deferred.resolve(newReminder);
          }).catch(deferred.reject);
          deferred.resolve();
          return deferred.promise;
        }
        promises.push(promiseFn());
      })

      if (removedItems.length > 0) {
        promises.push(NstSvcTaskFactory.removeReminder(vm.taskId, getCommaSeparate(removedItems)));
      }

      if (newItems.length > 0 || removedItems.length > 0) {
        $q.all(promises).then(function () {
          vm.modelBackUp.reminders = _.cloneDeep(vm.model.reminders);
          isUpdated = true;
        });
      }
    }

    function createRelatedTask() {
      $rootScope.$broadcast('create-related-task', {id: vm.taskId});
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

    eventReferences.push($scope.$watch(function () {
      return {
        titleFocus: vm.titleFocus,
        assigneeFocus: vm.assigneeFocus,
        dueDateFocus: vm.dueDateFocus,
        descriptionFocus: vm.descriptionFocus,
        todoFocus: vm.todoFocus,
        attachmentFocus: vm.attachmentFocus,
        watcherFocus: vm.watcherFocus,
        editorFocus: vm.editorFocus,
        labelFocus: vm.labelFocus,
        reminderFocus: vm.reminderFocus
      };
    }, function (newVal, _) {

      if (_.countBy(Object.values(newVal))['true'] > 1) {
        vm.todoFocus = false;
      }
    }, true));

    function labelClick(data) {
      $scope.$dismiss();

      $timeout(function () {
        var searchQuery = new NstSearchQuery('');
        searchQuery.addLabel(data.title);
        $state.go('app.task.search', {
          search: NstSearchQuery.encode(searchQuery.toString())
        });
      }, 200);
    }

    function reminderClick() {
      $scope.$dismiss();
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

      oldList.push.apply(oldList, newItems);
    }

    function isIdentical(oldList, newList) {
      if (newList.length === 0) {
        return false;
      }
      var sameItems = _.intersectionBy(newList, oldList, 'id');
      return sameItems.length === newList.length;
    }

    eventReferences.push($rootScope.$on(NST_TASK_EVENT_ACTION.TASK_ACTIVITY, function (event, data) {
      if (data.taskId === vm.taskId) {
        getTaskWithoutCache(data.taskId)
      }
    }));

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
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
