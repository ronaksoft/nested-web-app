(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstAttachmentView', AttachmentView);

  function AttachmentView(NST_FILE_TYPE) {
    return {
      restrict: 'E',
      scope: {
        attachment: '='
      },
      replace: true,
      link: function (scope) {
        update(scope);
        scope.$watch('attachment', function () {
          update(scope);
        });
      },
      template: '<div class="nst-preview-pic-mode" data-ng-include="tplUrl" data-ng-init="attachment = attachment"></div>'
    };

    function update(scope) {
      var type = scope.attachment.type;
      scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';

      switch (type){
        case NST_FILE_TYPE.IMAGE:
          scope.tplUrl = 'app/components/attachments/view/single/partials/image.html';
          break;

        case NST_FILE_TYPE.MULTIMEDIA:
          scope.tplUrl = 'app/components/attachments/view/single/partials/media.html';
          break;

        case NST_FILE_TYPE.ARCHIVE:
          scope.tplUrl = 'app/components/attachments/view/single/partials/archive.html';
          break;

        case NST_FILE_TYPE.DOCUMENT:
          scope.tplUrl = 'app/components/attachments/view/single/partials/document.html';
          break;

        case NST_FILE_TYPE.PDF:
          scope.tplUrl = 'app/components/attachments/view/single/partials/pdf.html';
          break;
      }
    }
  }
})();
