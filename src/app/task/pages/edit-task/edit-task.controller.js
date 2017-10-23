(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('EditTaskController', EditTaskController);

  /** @ngInject */
  function EditTaskController($q, $timeout, $scope, $state, $rootScope, $stateParams, NstSvcAuth, _, toastr, NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS, NstUtility, NstSvcTaskFactory, NstSvcTaskUtility) {
    var vm = this;
    // var eventReferences = [];

    vm.user = NstSvcAuth.user;

    vm.taskId = '';
    vm.mode = 'edit';
    vm.editMode = true;

    vm.isOpenBinder = false;

    vm.openBinder = openBinder;
    vm.bindRow = bindRow;

    function openBinder() {
      vm.isOpenBinder =! vm.isOpenBinder;
    }
    function bindRow(key) {
      vm[key] = true;
      vm.isOpenBinder = false;
    }
    //

    (function () {
      vm.taskId = $stateParams.taskId;
      getTask(vm.taskId);
      getActivities(vm.taskId);
    })();

    vm.model = {
      isRelated: false,
      titleLengthLimit: 64,
      assignor: null,
      status: null,
      counters: {},
      title:  '',
      assignees: [],
      dueDate: null,
      description: '',
      todos: [],
      attachments: [],
      watchers: [],
      labels: []
    };

    vm.modelBackUp = Object.assign({}, vm.model);

    vm.taskActivities = [];

    vm.backDropClick = backDropClick;
    vm.showMoreOption = false;
    vm.datePickerconfig = {
      allowFuture: true
    };

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

    vm.assigneeFocus = false;
    vm.assigneeIcon = 'no-assignee';
    vm.assigneePlaceholder = NstSvcTranslation.get('Add assignee or candidates');
    vm.removeAssignees = removeAssignees;

    vm.dueDateFocus = false;
    vm.dueDatePlaceholder = NstSvcTranslation.get('+ Set a due time (optional)');
    vm.removeDueDate = removeDueDate;
    vm.enableDue = false;

    vm.descriptionFocus = false;
    vm.descriptionPlaceholder = NstSvcTranslation.get('+ Add a Description...');
    vm.enableDescription = false;
    vm.updateDescription = updateDescription;

    vm.todoFocus = false;
    vm.todoPlaceholder = NstSvcTranslation.get('+ Add a to-do');
    vm.removeTodos = removeTodos;
    vm.enableTodo = false;

    vm.attachmentFocus = false;
    vm.removeAttachments = removeAttachments;
    vm.enableAttachment = false;

    vm.watcherFocus = false;
    vm.watcherPlaceholder = NstSvcTranslation.get('Add peoples who wants to follow task...');
    vm.removeWatchers = removeWatchers;
    vm.enableWatcher = false;

    vm.labelFocus = false;
    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');
    vm.removeLabels = removeLabels;
    vm.enableLabel = false;

    vm.isDisabled = isDisabled;

    vm.getTaskIcon = NstSvcTaskUtility.getTaskIcon;

    var dataInit = false;

    function getTask(id) {
      NstSvcTaskFactory.get(id).then(function (task) {
        vm.model.title = task.title;
        vm.model.assignor = task.assignor;
        vm.model.counters = task.counters;

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
        }

        if (task.dueDate !== undefined) {
          vm.model.dueDate = new Date(task.dueDate);
          // vm.enableDue = true;
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

        if (task.labels !== undefined) {
          vm.model.labels = task.labels;
          vm.enableLabel = true;
        }

        vm.modelBackUp = Object.assign({}, vm.model);

        $timeout(function () {
          dataInit = true;
        }, 100);
      });
    }
    function getActivities(id) {
      NstSvcTaskFactory.getActivities(id, false, 0, 16).then(function (acts) {
        vm.taskActivities = acts;
      });
    }


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

    $scope.$watch(function () {
      return vm.model.assignees;
    }, function (newVal) {
      getAssigneeIcon(newVal);
    }, true);

    function removeDueDate() {
      vm.model.dueDate = null;
    }

    function removeTodos() {
      vm.removeTodoItems.call();
    }

    function removeAttachments() {
      vm.removeAttachmentItems.call();
    }

    function removeWatchers() {
      vm.removeWatcherItems.call();
    }

    function removeLabels() {
      vm.removeLabelItems.call();
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
      dueDate: null
    };

    var updateDebouncer = _.debounce(updateTask, 1000);

    function updateTitle(text) {
      if (vm.model.title === text) {
        return;
      }
      taskUpdateModel.title = text;
      updateDebouncer.call();
    }

    function updateDescription(text) {
      if (vm.model.description === text) {
        return;
      }
      taskUpdateModel.description = text;
      updateDebouncer.call();
    }

    function updateDueDate(date) {
      if (vm.model.dueDate === date) {
        return;
      }
      taskUpdateModel.dueDate = new Date(date).getTime();
      updateDebouncer.call();
    }

    $scope.$watch(function () {
      return vm.model.dueDate;
    }, function (newVal) {
      if (dataInit) {
        updateDueDate(newVal);
      }
    }, true);

    function updateTask() {
      NstSvcTaskFactory.taskUpdate(vm.taskId, taskUpdateModel.title, taskUpdateModel.description, taskUpdateModel.dueDate).then(function () {
        vm.modelBackUp = Object.assign({}, vm.model);
      }).catch(function (error) {
        console.log(error);
      });
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

    function updateAssignee(assignees) {
      var oldData = getNormalValue(vm.modelBackUp.assignees)
      var newItems = _.differenceBy(assignees, oldData, 'id');
      var removedItems = _.differenceBy(oldData, assignees, 'id');

      var promises = [];
      if (newItems.length > 0) {
        promises.push(newItems);
      }
      if (removedItems.length > 0) {
        promises.push(removedItems);
      }
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
        $timeout(function() {
          focusInit = false;
          handleFocus(newVal, oldVal);
        });
      } else {
        focusInit = true;
      }
    }, true);

    function handleFocus (newVal, oldVal) {
      for (var i in newVal) {
        if (newVal[i] === oldVal[i]) {
          vm[i] = false;
        }
      }
    }

    $scope.$on('$destroy', function () {
      console.log('destroy');
    });
  }
})();
