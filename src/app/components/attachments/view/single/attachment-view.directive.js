(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentView', AttachmentView);

  function AttachmentView(NST_FILE_TYPE, $sce) {
    return {
      restrict: 'E',
      scope: {
        attachment: '='
      },
      replace: true,
      link: function (scope) {
        scope.$watch('attachment', function () {
          if (scope.attachment && scope.attachment.type) {
            update(scope);
          }
        });
      },
      template: '<div class="nst-preview-pic-mode" data-ng-include="tplUrl" data-ng-init="attachment = attachment"></div>'
    };

    function update(scope) {
      var type = scope.attachment.type;

      scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }

      scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';

      switch (type){
        case NST_FILE_TYPE.IMAGE:
        case NST_FILE_TYPE.GIF:
          scope.tplUrl = 'app/components/attachments/view/single/partials/image.html';
          break;

        case NST_FILE_TYPE.VIDEO:
          scope.tplUrl = 'app/components/attachments/view/single/partials/video.html';
          break;

        case NST_FILE_TYPE.AUDIO:
          scope.tplUrl = 'app/components/attachments/view/single/partials/audio.html';
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
        default:
          scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';
      }
    }
  }
})();
