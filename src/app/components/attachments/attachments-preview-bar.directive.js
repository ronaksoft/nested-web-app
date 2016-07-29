(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar(NST_ATTACHMENTS_PREVIEW_BAR_INTERNAL_MODE) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/attachments-preview-bar.html',
      scope: {
        onItemClick: '&',
        items: '=',
        mode: '='
      },
      link: function (scope, element, attributes) {
        scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_INTERNAL_MODE.BADGE;
        if (Object.values(NST_ATTACHMENTS_PREVIEW_BAR_INTERNAL_MODE).indexOf(attributes.mode) > -1) {
          scope.internalMode = attributes.mode;
        }
      }
    };
  };
})();
