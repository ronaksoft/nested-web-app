(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('CreateTaskController', CreateTaskController);

  /** @ngInject */
  function CreateTaskController($q, $timeout, $scope, $rootScope, NstSvcAuth, NstSvcTaskFactory, _, toastr,
                                NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS, NstUtility, NstSvcTaskUtility, NstSvcStore,
                                modalData) {
    var vm = this;
    // var eventReferences = [];
    vm.titleLengthLimit = 64;
    vm.showMoreOption = false;
    vm.user = NstSvcAuth.user;
    vm.minimize = false;
    vm.minimizeModal = minimizeModal;
    vm.abortBackgroundCreateTask = abortBackgroundCreateTask;
    vm.editMode = true;
    vm.datePickerconfig = {
      allowFuture: true
    };
    vm.backDropClick = backDropClick;
    function backDropClick() {
      if (vm.model.dueDate !== null ||
          _.trim(vm.model.title).length !== 0 ||
          _.trim(vm.model.desc).length !== 0 ||
          vm.model.assignees.length !== 0 ||
          vm.model.todos.length !== 0 ||
          vm.model.attachments.length !== 0 ||
          vm.model.watchers.length !== 0 ||
          vm.model.labels.length !== 0) {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Closing creating task modal'),
          body: NstSvcTranslation.get('Are you sure? <br>All the filled data will be lost'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          $scope.$dismiss();
        });
      } else {
        $scope.$dismiss();
      }
    }

    vm.modalId = modalData.modalId;

    vm.model = {
      isRelated: false,
      titleLengthLimit: 64,
      assignor: null,
      status: null,
      title:  '',
      assignees: [],
      dueDateText: null,
      dueDate: null,
      hasDueTime: false,
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


    function minimizeModal() {
      vm.minimize = true;
      $('body').removeClass('active-compose');
      $('html').removeClass('_oh');
      $rootScope.$broadcast('minimize-background-modal');
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
      return !((response.validWithoutAttachment && vm.model.attachments.length > 0) || response.valid);
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
          task.dueDate = vm.model.dueDate*1000;
        }
        if (_.trim(vm.model.description).length > 0) {
          task.description = vm.model.description;
        }
        if (vm.model.todos.length > 0) {
          task.todos = NstSvcTaskUtility.getTodoTransform(vm.model.todos);
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
        if (modalData.relatedTaskId  !== null) {
          task.relatedTask = modalData.relatedTaskId;
        }
        NstSvcTaskFactory.create(task).then(function (data) {
          toastr.success(NstSvcTranslation.get('Task created successfully!'));
          $rootScope.$broadcast('task-created', {
            id: data.task.id
          });
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Something went wrong!'));
        });
        closeModal();
      } else if (response.validWithoutAttachment && vm.model.attachments.length > 0) {
        minimizeModal();
      }
    }

    $scope.$watch(function () {
      return vm.model.attachments
    }, updateTotalAttachmentsRatio, true);

    function updateTotalAttachmentsRatio() {
      if (!vm.minimize) {
        return;
      }
      if (NstSvcTaskUtility.validateTask(vm.model).valid) {
        $timeout(function () {
          vm.create();
        }, 100);
      }
    }

    function abortBackgroundCreateTask() {
      _.forEach(vm.model.attachments.requests, function (request) {
        if (request) {
          NstSvcStore.cancelUpload(request);
        }
      });
      vm.model.attachments = [];
      $scope.$dismiss();
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
      $rootScope.$broadcast('close-background-modal', {
        id: vm.modalId
      });
    });
  }
})();
