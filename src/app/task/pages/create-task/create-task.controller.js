(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('createTaskController', createTaskController);

  /** @ngInject */
  function createTaskController($q, $timeout, $scope, $state, $stateParams, $uibModal, $rootScope, NstSvcAuth, _, toastr, NstSvcTranslation) {
    var vm = this;
    // var eventReferences = [];
    vm.showMoreOption = false;
    vm.user = NstSvcAuth.user
    vm.datePickerconfig = {
      allowFuture: true
    };

    vm.title = '';
    vm.titleFocus = false;

    vm.assigneeFocusTrigger = 0;
    vm.assigneeTodoTrigger = 0;
    vm.enterSubjectTask = function (){
      vm.assigneeFocusTrigger++;
    };
    vm.enterDescriptionTask = function (){
      vm.assigneeTodoTrigger++;
    };
    vm.assigneeFocus = false;
    vm.assigneesData = [];
    vm.assigneeIcon = 'no-assignee';
    vm.assigneePlaceholder = NstSvcTranslation.get('Add assignee or candidates');
    vm.removeAssignees = function () {
      vm.removeAssigneeItems.call();
    };

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

    vm.dueDateFocus = false;
    vm.dueDate = null;

    vm.descFocus = false;
    vm.desc = '';
    vm.descPlaceholder = NstSvcTranslation.get('+ Add a Description...');

    vm.todoFocus = false;
    vm.todosData = [];
    vm.todoPlaceholder = NstSvcTranslation.get('+ add a to-do');
    vm.removeTodos = function () {
      vm.removeTodoItems.call();
    };

    vm.attachmentFocus = false;
    vm.attachmentsData = [];
    vm.removeAttachments = function () {
      vm.removeAttachmentItems.call();
    };

    $scope.$watch(function () {
      return vm.attachmentsData;
    }, function (newVal) {
      console.log(newVal);
    }, true);

    vm.watcherFocus = false;
    vm.watchersData = [];
    vm.watcherPlaceholder = NstSvcTranslation.get('Add peoples who wants to follow task...');
    vm.removeWatchers = function () {
      vm.removeWatcherItems.call();
    };

    vm.labelFocus = false;
    vm.labelsData = [];
    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');
    vm.removeLabels = function () {
      vm.removeLabelItems.call();
    };

    var initializing = true;
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
      if (initializing) {
        $timeout(function() {
          initializing = false;
          handleFocus(newVal, oldVal);
        });
      } else {
        initializing = true;
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
