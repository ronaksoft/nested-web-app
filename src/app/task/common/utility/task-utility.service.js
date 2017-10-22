(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcTaskUtility', NstSvcTaskUtility);

  /** @ngInject */
  function NstSvcTaskUtility($q, _, NST_TASK_PROGRESS_ICON, NstSvcTranslation, NstUtility, NST_ATTACHMENT_STATUS) {

    function TaskUtility() {
    }

    TaskUtility.prototype.constructor = TaskUtility;
    TaskUtility.prototype.getTaskIcon = getTaskIcon;
    TaskUtility.prototype.validateTask = validateTask;

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
      if (!isAttachmentValid) {
        errors.push(NstSvcTranslation.get('Please wait till attachments upload completely'));
      }
      return {
        valid: errors.length === 0,
        errors: errors,
        attachment: isAttachmentValid
      }
    }

    return new TaskUtility();
  }
})();
