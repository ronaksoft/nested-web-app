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
      }
    }
  }
})();
