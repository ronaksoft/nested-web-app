(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('CreateTaskController', CreateTaskController);

  /** @ngInject */
  function CreateTaskController($q, $timeout, $scope, $rootScope, NstSvcAuth, NstSvcTaskFactory, _, toastr, NstSvcTaskDraft,
                                NstSvcTranslation, NstTask, NST_ATTACHMENT_STATUS, NstUtility, NstSvcTaskUtility, NstSvcStore,
                                modalData) {
    var vm = this;
    var eventReferences = [];

    vm.titleLengthLimit = 64;
    vm.descriptionLengthLimit = 511;
    vm.showMoreOption = null;
    vm.user = NstSvcAuth.user;
    vm.minimize = false;
    vm.minimizeModal = minimizeModal;
    vm.abortBackgroundCreateTask = abortBackgroundCreateTask;
    vm.editMode = true;
    vm.datePickerconfig = {
      allowFuture: true
    };
    vm.backDropClick = backDropClick;
    vm.setFocus = setFocus;

    function backDropClick() {
      if (vm.model.dueDate !== null ||
        _.trim(vm.model.title).length !== 0 ||
        _.trim(vm.model.description).length !== 0 ||
        vm.model.assignees.length !== 0 ||
        vm.model.todos.length !== 0 ||
        vm.model.attachments.length !== 0 ||
        vm.model.watchers.length !== 0 ||
        vm.model.editors.length !== 0 ||
        vm.model.labels.length !== 0) {
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Closing creating task modal'),
          body: NstSvcTranslation.get('By discarding this task, you will lose your draft. Are you sure you want to discard?'),
          confirmText: NstSvcTranslation.get('Discard'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Draft')
        }).then(function () {
          discardDraft();
          $scope.$dismiss();
        }).catch(function () {
          saveDraft();
          $scope.$dismiss();
        });
      } else {
        $scope.$dismiss();
      }
    }

    function saveDraft() {
      var draft = {
        title: vm.model.title,
        assignees: vm.model.assignees,
        dueDate: vm.model.dueDate,
        hasDueTime: vm.model.hasDueTime,
        description: vm.model.description,
        todos: vm.model.todos,
        attachments: vm.model.attachments,
        watchers: vm.model.watchers,
        editors: vm.model.editors,
        labels: vm.model.labels
      };
      NstSvcTaskDraft.save(draft);
      $rootScope.$broadcast('task-draft-change');
    }

    function discardDraft() {
      NstSvcTaskDraft.discard();
      $rootScope.$broadcast('task-draft-change');
    }

    function loadDraft() {
      var task = NstSvcTaskDraft.get();
      if (!task) {
        return;
      }
      if (task.title) {
        vm.model.title = task.title;
      }

      if (task.assignees) {
        vm.model.assignees = {
          init: true,
          data: task.assignees
        };
      }

      if (task.dueDate && task.dueDate !== 0) {
        vm.model.dueDate = task.dueDate;
        vm.model.hasDueTime = task.hasDueTime;
      } else {
        vm.model.dueDate = null;
      }

      if (task.description && _.trim(task.description).length > 0) {
        vm.model.description = task.description;
        vm.showMoreOption = true;
      }

      if (task.todos && task.todos.length > 0) {
        vm.model.todos = task.todos;
        vm.showMoreOption = true;
      }

      if (task.attachments && task.attachments.length > 0) {
        vm.model.attachments = {
          init: true,
          data: task.attachments
        };
        vm.showMoreOption = true;
      }

      if (task.watchers && task.watchers.length > 0) {
        vm.model.watchers = {
          init: true,
          data: task.watchers
        };
        vm.showMoreOption = true;
      }

      if (task.editors && task.editors.length > 0) {
        vm.model.editors = {
          init: true,
          data: task.editors
        };
        vm.showMoreOption = true;
      }

      if (task.labels && task.labels.length > 0) {
        vm.model.labels = {
          init: true,
          data: task.labels
        };
        vm.showMoreOption = true;
      }
    }

    vm.modalId = modalData.modalId;

    vm.model = {
      isRelated: false,
      titleLengthLimit: 64,
      assignor: null,
      status: null,
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
      labels: []
    };

    loadDraft();

    if (modalData !== undefined && modalData.init !== undefined) {
      if (modalData.init.title) {
        vm.model.title = modalData.init.title;
      }
      if (modalData.init.description && _.trim(modalData.init.description).length > 0) {
        vm.model.description = modalData.init.description;
        vm.showMoreOption = true;
      }
      if (modalData.init.attachments && modalData.init.attachments.length > 0) {
        vm.model.attachments = {
          init: true,
          data: modalData.init.attachments
        };
        vm.showMoreOption = true;
      }
      if (modalData.init.labels && modalData.init.labels.length > 0) {
        vm.model.labels = {
          init: true,
          data: modalData.init.labels
        };
        vm.showMoreOption = true;
      }
    }

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

    vm.assigneeIcon = 'no-assignee';
    vm.assigneePlaceholder = NstSvcTranslation.get('Add assignee or candidates');
    vm.removeAssignees = removeAssignees;

    vm.dueDatePlaceholder = NstSvcTranslation.get('+ Set a due time (optional)');
    vm.removeDueDate = removeDueDate;

    vm.descPlaceholder = NstSvcTranslation.get('+ Add a Description...');

    vm.todoPlaceholder = NstSvcTranslation.get('+ Add a to-do');
    vm.removeTodos = removeTodos;

    vm.removeAttachments = removeAttachments;

    vm.watcherPlaceholder = NstSvcTranslation.get('Add peoples who wants to follow task...');
    vm.removeWatchers = removeWatchers;

    vm.editorPlaceholder = NstSvcTranslation.get('Add peoples who wants to edit task...');
    vm.removeEditors = removeEditors;

    vm.labelPlaceholder = NstSvcTranslation.get('Add labels...');
    vm.removeLabels = removeLabels;

    vm.isDisabled = isDisabled;
    vm.create = create;


    function minimizeModal() {
      vm.minimize = true;
      $('.task-modal-element').addClass('minimized-task');
      $('html').removeClass('_oh');
      $rootScope.$broadcast('minimize-background-modal', {
        id: vm.modalId
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

    eventReferences.push($scope.$watch(function () {
      return vm.model.assignees;
    }, function (newVal) {
      getAssigneeIcon(newVal);
    }, true));

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

    function removeEditors() {
      vm.removeEditorItems.call();
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
          task.dueDate = vm.model.dueDate * 1000;
          task.hasDueTime = vm.model.hasDueTime;
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
        if (vm.model.editors.length > 0) {
          task.editors = vm.model.editors;
        }
        if (vm.model.labels.length > 0) {
          task.labels = vm.model.labels;
        }
        if (modalData.relatedTaskId !== null) {
          task.relatedTask = modalData.relatedTaskId;
        }
        if (modalData.relatedPostId !== null) {
          task.relatedPost = modalData.relatedPostId;
        }
        NstSvcTaskFactory.create(task).then(function (data) {
          toastr.success(NstSvcTranslation.get('Task created successfully!'));
          discardDraft();
          $rootScope.$broadcast('task-created', {
            id: data.task.id,
            callbackUrl: modalData.callbackUrl
          });
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Something went wrong!'));
        });
        closeModal();
      } else if (response.validWithoutAttachment && vm.model.attachments.length > 0) {
        minimizeModal();
      }
    }

    eventReferences.push($scope.$watch(function () {
      return vm.model.attachments
    }, updateTotalAttachmentsRatio, true));

    var createInBackground = true;

    function updateTotalAttachmentsRatio() {
      if (!vm.minimize || !createInBackground) {
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
      createInBackground = false;
      vm.model.attachments = [];
      $scope.$dismiss();
    }

    function closeModal() {
      $scope.$dismiss();
    }

    function setFocus(item) {
      var k = item + 'Focus';
      initiateFocus();
      vm[k] = true;
    }

    function initiateFocus() {
      vm.assigneeFocus = false;
      vm.dueDateFocus = false;
      vm.descriptionFocus = false;
      vm.todoFocus = false;
      vm.attachmentFocus = false;
      vm.labelFocus = false;
      vm.watcherFocus = false;
      vm.weditorFocus = false;
      vm.titleFocus = false;
    }

    initiateFocus();

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
        labelFocus: vm.labelFocus
      };
    }, function (newVal) {
      if (_.countBy(Object.values(newVal))['true'] > 1) {
        vm.todoFocus = false;
      }
    }, true));

    $scope.$on('$destroy', function () {
      $rootScope.$broadcast('close-background-modal', {
        id: vm.modalId
      });
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
