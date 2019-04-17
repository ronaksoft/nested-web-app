(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskAttachment', taskAttachment);

  /** @ngInject */
  function taskAttachment() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/attachment/attachment.html',
      controller: 'TaskAttachmentController',
      controllerAs: 'ctlAttachment',
      scope: {},
      bindToController: {
        attachmentsData: '=',
        addItem: '=?',
        removeItem: '=?',
        taskId: '=?',
        removeItems: '='
      }
    };
  }

})();
