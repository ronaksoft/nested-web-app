(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('createTaskController', createTaskController);

  /** @ngInject */
  function createTaskController($q, $timeout, $scope, $rootScope, NstSvcAuth, _, toastr, NstSvcTranslation, NstTask) {
    var vm = this;
    // var eventReferences = [];
    vm.showMoreOption = false;
    vm.user = NstSvcAuth.user
    vm.datePickerconfig = {
      allowFuture: true
    };

    vm.title = '';
    vm.titleFocus = false;
    vm.titlePlaceholder = NstSvcTranslation.get('Enter a Task Title');

    vm.assigneeFocusTrigger = 0;
    vm.assigneeTodoTrigger = 0;
    vm.enterSubjectTask = function () {
      vm.assigneeFocusTrigger++;
    };
    vm.enterDescriptionTask = function () {
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

    vm.create = function () {

    };

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
  }
})();
