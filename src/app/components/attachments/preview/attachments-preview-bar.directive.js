(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar(NST_ATTACHMENTS_PREVIEW_BAR_MODE) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/preview/main.html',
      scope: {
        onItemClick: '=',
        items: '=',
        mode: '='
      },
      link: function (scope) {
        scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO;

        if (modeIsValid(scope.mode)) {
          scope.internalMode = scope.mode;
        }

        if (scope.internalMode === NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO){
          if (_.some(scope.items, 'hasThumbnail')) {
            scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL;
          } else {
            scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.BADGE;
          }
        }

        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item, scope.items);
          }
        };
      }
    };

    function modeIsValid(mode) {
      return _.values(NST_ATTACHMENTS_PREVIEW_BAR_MODE).indexOf(mode) > -1;
    }
  }
})();
