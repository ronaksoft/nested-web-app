(function() {
  'use strict';

  angular
    .module('nested')
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
        attachments: '=',
        previewMode: '='
      }
    };
  }
})();
