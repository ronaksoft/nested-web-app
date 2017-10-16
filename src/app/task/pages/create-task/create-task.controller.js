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

    vm.dueDate = null;

    vm.todoFocus = false;
    vm.todosData = [];
    vm.todoPlaceholder = NstSvcTranslation.get('+ add a to-do');
    vm.removeTodos = function () {
      vm.removeTodoItems.call();
    };

    vm.attachmentsData = [];
    vm.removeAttachments = function () {
      vm.removeAttachmentItems.call();
    };

    $scope.$watch(function () {
      return vm.attachmentsData;
    }, function (newVal) {
      console.log(newVal);
    }, true);

    // Form treats
    vm.assigneFocusTrigger = 0;
    vm.assigneTodoTrigger = 0;
    vm.enterSubjectTask = function (){
      vm.assigneFocusTrigger++;
    };

    vm.enterDescriptionTask = function (){
      vm.assigneTodoTrigger++;
    };
  }
})();
