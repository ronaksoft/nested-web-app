(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsView', AttachmentsView);

  function AttachmentsView() {
    return {
      restrict: 'E',
      controller: 'AttachmentsViewController',
      controllerAs: 'ctlAttachmentsView',
      templateUrl: 'app/components/attachments/view/main.html',
      bindToController: {
        postId: '='
      },
      scope: {
        postId : '=',
        attachments: '=',
        previewMode: '=',
        markRead: '=?',
        forceMode: '=?',
        sender: '='
      }
    };
  }
})();
