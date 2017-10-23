(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('CreateTaskController', CreateTaskController);

  /** @ngInject */
  function CreateTaskController($q, $timeout, $scope, $rootScope, NstSvcAuth, NstSvcTaskFactory, _, toastr, NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS, NstUtility, NstSvcTaskUtility) {
    var vm = this;
    // var eventReferences = [];
    vm.titleLengthLimit = 64;
    vm.showMoreOption = false;
    vm.user = NstSvcAuth.user;
    vm.editMood = true;
    vm.datePickerconfig = {
      allowFuture: true
    };
    vm.backDropClick = backDropClick;
    function backDropClick() {

      $scope.$dismiss();
    }

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

    vm.assigneeFocus = false;
    vm.assigneeIcon = 'no-assignee';
    vm.assigneePlaceholder = NstSvcTranslation.get('Add assignee or candidates');
    vm.removeAssignees = removeAssignees;

    vm.dueDateFocus = false;
    vm.dueDatePlaceholder = NstSvcTranslation.get('+ Set a due time (optional)');
    vm.removeDueDate = removeDueDate;

    vm.descFocus = false;
    vm.descPlaceholder = NstSvcTranslation.get('+ Add a Description...');

    vm.todoFocus = false;
    vm.todoPlaceholder = NstSvcTranslation.get('+ Add a to-do');
    vm.removeTodos = removeTodos;

    vm.attachmentFocus = false;
    vm.removeAttachments = removeAttachments;

    vm.watcherFocus = false;
    vm.watcherPlaceholder = NstSvcTranslation.get('Add peoples who wants to follow task...');
    vm.removeWatchers = removeWatchers;

    vm.labelFocus = false;
    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');
    vm.removeLabels = removeLabels;

    vm.isDisabled = isDisabled;
    vm.create = create;


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

    function getTodoTransform(todos) {
      return _.map(todos, function (todo) {
        return btoa(todo.text) + ';' + todo.weight;
      }).join(',');
    }

    function isDisabled() {
      var response = NstSvcTaskUtility.validateTask(vm.model);
      return !response.valid;
    }

    function create() {
      var response = NstSvcTaskUtility.validateTask(vm.model);
      _.forEach(response.errors, function (error) {
        toastr.error(error);
      });
      if (response.valid) {
        var task = new NstTask();
        task.title = vm.model.title;
        if (vm.model.assignees.length === 1) {
          task.assignee = vm.model.assignees[0];
        } else {
          task.candidates = vm.model.assignees;
        }
        if (vm.model.dueDate !== null) {
          task.dueDate = new Date(vm.model.dueDate).getTime();
        }
        if (_.trim(vm.model.description).length > 0) {
          task.description = vm.model.description;
        }
        if (vm.model.todos.length > 0) {
          task.todos = getTodoTransform(vm.model.todos);
        }
        if (vm.model.attachments.length > 0) {
          task.attachments = vm.model.attachments;
        }
        if (vm.model.watchers.length > 0) {
          task.watchers = vm.model.watchers;
        }
        if (vm.model.labels.length > 0) {
          task.labels = vm.model.labels;
        }
        NstSvcTaskFactory.create(task).then(function () {
          toastr.success(NstSvcTranslation.get('Task created successfully!'));
          $rootScope.$broadcast('task-created');
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Something went wrong!'));
        });
        closeModal();
      }
    }

    function closeModal() {
      $scope.$dismiss();
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
      console.log('destroy');
    });
  }
})();
