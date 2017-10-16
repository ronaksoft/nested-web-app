(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('createTaskController', createTaskController);

  /** @ngInject */
  function createTaskController($q, $timeout, $scope, $state, $stateParams, $uibModal, $rootScope, NstSvcUserFactory, NstSvcAuth, _,
    NST_ATTACHMENT_STATUS, NstSvcAttachmentMap, toastr, NstSvcTranslation, NstUtility, NstSvcLogger, NstSvcSystemConstants, NstSvcAttachmentFactory,
    NST_CONFIG, $log, NST_FILE_TYPE, NstPicture, NstSvcFileType, NstSvcStore, NST_STORE_UPLOAD_TYPE) {
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

    vm.labelFocus = false;
    vm.labelsData = [];
    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');

    vm.dueDate = null;

    vm.todoFocus = false;
    vm.todosData = [];
    vm.todoPlaceholder = NstSvcTranslation.get('+ add a to-do');

    vm.attachmentsData = [];

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
