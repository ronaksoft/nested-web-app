(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar(NST_ATTACHMENTS_PREVIEW_BAR_MODE, NST_ATTACHMENTS_PREVIEW_BAR_ORDER) {
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

        scope.items = setOrder(scope.items, NST_ATTACHMENTS_PREVIEW_BAR_ORDER.order);

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

    /**
     * Add order property to items
     *
     * @param items[]
     * @param orderMap []
     */
    function setOrder(items, orderMap) {
      for (var i = 0 ; i < items.length ; i++){
        var index = orderMap.indexOf(items[i].type);
        if (index > -1){
          items[i]['order'] = index;
        }else {
          items[i]['order'] = 999;
        }
      }
      return items;
    }
  }
})();
