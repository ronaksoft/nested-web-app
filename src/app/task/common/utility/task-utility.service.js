(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcTaskUtility', NstSvcTaskUtility);

  /** @ngInject */
  function NstSvcTaskUtility($q, _, NST_TASK_PROGRESS_ICON, NstSvcTranslation, NstUtility, NST_ATTACHMENT_STATUS, $uibModal, $timeout) {

    function TaskUtility() {
    }

    TaskUtility.prototype.constructor = TaskUtility;
    TaskUtility.prototype.getTaskIcon = getTaskIcon;
    TaskUtility.prototype.validateTask = validateTask;
    TaskUtility.prototype.getTodoTransform = getTodoTransform;
    TaskUtility.prototype.promptModal = promptModal;
    TaskUtility.prototype.getValidUser = getValidUser;
    TaskUtility.prototype.b64EncodeUnicode = b64EncodeUnicode;
    TaskUtility.prototype.b64DecodeUnicode = b64DecodeUnicode;

    function getTaskIcon(status, progress) {
      switch (status) {
        default:
        case 0x01:
          return NST_TASK_PROGRESS_ICON.NOT_ASSIGNED;
        case 0x02:
          if (progress < 0) {
            return NST_TASK_PROGRESS_ICON.ASSIGNED_NO_CHECKLIST;
          } else if (progress === 0) {
            return NST_TASK_PROGRESS_ICON.ASSIGNED_CHECKLIST;
          } else {
            return NST_TASK_PROGRESS_ICON.ASSIGNED_PROGRESS;
          }
        case 0x03:
          return NST_TASK_PROGRESS_ICON.CANCELED;
        case 0x04:
          return NST_TASK_PROGRESS_ICON.REJECTED;
        case 0x05:
          return NST_TASK_PROGRESS_ICON.COMPLETED;
        case 0x06:
          return NST_TASK_PROGRESS_ICON.HOLD;
        case 0x07:
          return NST_TASK_PROGRESS_ICON.OVERDUE;
      }
    }

    function validateTask(model) {
      var errors = [];
      if (_.trim(model.title) === '') {
        errors.push(NstSvcTranslation.get('Please enter the task title'));
      } else if (_.trim(model.title).length > model.titleLengthLimit) {
        errors.push(NstUtility.string.format(NstSvcTranslation.get('Task title shouldnt be more than {0} characters'), model.titleLengthLimit));
      }
      if (model.assignees.length === 0) {
        errors.push(NstSvcTranslation.get('Please add assignee or candidates'));
      }
      var isAttachmentValid = true;
      for (var i in model.attachments) {
        if (model.attachments[i].status !== NST_ATTACHMENT_STATUS.ATTACHED) {
          isAttachmentValid = false;
          break;
        }
      }
      var attachmentError = [];
      if (!isAttachmentValid) {
        attachmentError.push(NstSvcTranslation.get('Please wait till attachments upload completely'));
      }
      return {
        valid: (errors.length === 0 && isAttachmentValid),
        validWithoutAttachment: errors.length === 0,
        errors: errors,
        attachmentError: attachmentError,
        attachment: isAttachmentValid
      }
    }

    function b64EncodeUnicode(str) {
      // first we use encodeURIComponent to get percent-encoded UTF-8,
      // then we convert the percent encodings into raw bytes which
      // can be fed into btoa.
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }

    function b64DecodeUnicode(str) {
      return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    }

    function getTodoTransform(todos) {
      return _.map(_.filter(todos, function (todo) {
        return _.trim(todo.text).length > 0;
      }), function (todo) {
        return b64EncodeUnicode(todo.text) + ';' + todo.weight;
      }).join(',');
    }

    function promptModal(options) {
      return $uibModal.open({
        animation: false,
        templateUrl: 'app/label/partials/label-confirm-modal.html',
        controller: 'labelConfirmModalController',
        controllerAs: 'confirmModal',
        size: 'sm',
        resolve: {
          modalSetting: {
            title: options.title,
            body: options.body,
            confirmText: options.confirmText,
            confirmColor: options.confirmColor,
            cancelText: options.cancelText
          }
        }
      }).result;
    }

    function getValidUser(vm, userFn) {
      var validUser = undefined;
      getUser();
      function retry() {
        $timeout(function () {
          getUser();
        }, 200);
      }
      function getUser() {
        validUser = userFn.user;
        if (validUser === undefined) {
          retry();
        } else {
          vm.user = validUser;
        }
      }
    }

    return new TaskUtility();
  }
})();
