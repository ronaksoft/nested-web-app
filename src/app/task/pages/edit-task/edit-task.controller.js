(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('editTaskController', editTaskController);

  /** @ngInject */
  function editTaskController($q, $timeout, $scope, $state, $rootScope, $stateParams, NstSvcAuth, _, toastr, NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS, NstUtility, NstSvcTaskFactory, NstSvcTaskUtility) {
    var vm = this;
    // var eventReferences = [];

    vm.taskId = '';
    vm.mode = 'edit';
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
    })();

    vm.model = {
      isRelated: false,
      titleLengthLimit: 64,
      assignor: null,
      status: null,
      title:  '',
      assignees: [],
      dueDate: null,
      desc: '',
      todos: [],
      attachments: [],
      watchers: [],
      labels: []
    };

    vm.showMoreOption = false;
    vm.user = NstSvcAuth.user;
    vm.datePickerconfig = {
      allowFuture: true
    };

    vm.title = '';
    vm.titleFocus = false;
    vm.titlePlaceholder = NstSvcTranslation.get('Enter a Task Title');

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

    vm.descFocus = false;
    vm.descPlaceholder = NstSvcTranslation.get('+ Add a Description...');
    vm.enableDescription = false;

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

    function getTask(id) {
      NstSvcTaskFactory.get(id).then(function (task) {
        vm.model.title = task.title;
        vm.model.assignor = task.assignor;

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
          vm.model.desc = task.description;
          vm.enableDescription = true;
        }

        if (task.todos !== undefined) {
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

    var focusInit = true;
    $scope.$watch(function () {
      return {
        titleFocus: vm.titleFocus,
        assigneeFocus: vm.assigneeFocus,
        dueDateFocus: vm.dueDateFocus,
        descFocus: vm.descFocus,
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
