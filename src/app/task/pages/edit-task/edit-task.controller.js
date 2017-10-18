(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('editTaskController', editTaskController);

  /** @ngInject */
  function editTaskController($q, $timeout, $scope, $state, $rootScope, $stateParams, NstSvcAuth, _, toastr, NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS) {
    var vm = this;
    // var eventReferences = [];

    vm.taskId = '';
    vm.mode = 'edit';
    /** Ali */
    vm.enableDue = false;
    vm.enableDescription = false;
    vm.enableTodo = false;
    vm.enableAttachment = false;
    vm.enableWatcher = false;
    vm.enableLabel = false;
    vm.isOpenBinder = false;

    vm.openBinder = openBinder
    
    function openBinder() {
      vm.isOpenBinder =! vm.isOpenBinder;
    }
    // 
    (function () {
      vm.taskId = $stateParams.taskId;
    })();

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

    vm.assigneeFocus = false;
    vm.assigneesData = [];
    vm.assigneeIcon = 'no-assignee';
    vm.assigneePlaceholder = NstSvcTranslation.get('Add assignee or candidates');
    vm.removeAssignees = removeAssignees;

    vm.dueDateFocus = false;
    vm.dueDate = null;
    vm.dueDatePlaceholder = NstSvcTranslation.get('+ Set a due time (optional)');
    vm.removeDueDate = removeDueDate;

    vm.descFocus = false;
    vm.desc = '';
    vm.descPlaceholder = NstSvcTranslation.get('+ Add a Description...');

    vm.todoFocus = false;
    vm.todosData = [];
    vm.todoPlaceholder = NstSvcTranslation.get('+ Add a to-do');
    vm.removeTodos = removeTodos;

    vm.attachmentFocus = false;
    vm.attachmentsData = [];
    vm.removeAttachments = removeAttachments;

    vm.watcherFocus = false;
    vm.watchersData = [];
    vm.watcherPlaceholder = NstSvcTranslation.get('Add peoples who wants to follow task...');
    vm.removeWatchers = removeWatchers;

    vm.labelFocus = false;
    vm.labelsData = [];
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
      return vm.assigneesData;
    }, function (newVal) {
      getAssigneeIcon(newVal);
    }, true);

    function removeDueDate() {
      vm.dueDate = null;
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

    function check() {
      var errors = [];
      if (_.trim(vm.title) === '') {
        errors.push(NstSvcTranslation.get('Please enter the task title'));
      }
      if (vm.assigneesData.length === 0) {
        errors.push(NstSvcTranslation.get('Please add assignee or candidates'));
      }
      var isAttachmentValid = true;
      for (var i in vm.attachmentsData) {
        if (vm.attachmentsData[i].status !== NST_ATTACHMENT_STATUS.ATTACHED ) {
          isAttachmentValid = false;
          break;
        }
      }
      if (!isAttachmentValid) {
        errors.push(NstSvcTranslation.get('Please wait till attachments upload completely'));
      }
      return {
        valid: errors.length === 0,
        errors: errors,
        attachment: isAttachmentValid
      }
    }

    function isDisabled() {
      var response = check();
      return !response.valid;
    }

    function create () {
      var response = check();
      _.forEach(response.errors, function (error) {
        toastr.error(error);
      });
      if (response.valid) {
        var task = new NstTask();
        task.title = vm.title;
        if (vm.assigneesData.length === 1) {
          task.assignee = vm.assigneesData[0];
        } else {
          task.candidates = vm.assigneesData;
        }
        if (vm.dueDate !== null) {
          task.dueDate = vm.dueDate;
        }
        if (vm.todosData.length > 0) {
          task.todos = vm.todosData;
        }
        if (vm.attachmentsData.length > 0) {
          task.attachments = vm.attachmentsData;
        }
        if (vm.watchersData.length > 0) {
          task.watchers = vm.watchersData;
        }
        if (vm.labelsData.length > 0) {
          task.labels = vm.labelsData;
        }
        console.log(task);
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
