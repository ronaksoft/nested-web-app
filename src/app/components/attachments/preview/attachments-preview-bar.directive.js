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
      link: function (scope,ele) {
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

        if ( scope.items.length == 1 && scope.items[0].extension ==  "jpg" ) {
          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_ONLY_IMAGE;

          var wrpWidth = ele.parent().parent().width() - scope.flexDiv - 54;


          var imgOneRatio = scope.items[0].width / scope.items[0].height;

          var scale = wrpWidth / scope.items[0].width;
          scope.width = wrpWidth ;
          scope.height = wrpWidth * imgOneRatio
        }

        if ( scope.items.length == 2 && scope.items[0].extension ==  "jpg" && scope.items[1].extension ==  "jpg" ) {
          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_TWO_IMAGE;

          scope.flexDiv = 16;
          var wrpWidth = ele.parent().parent().width() - scope.flexDiv;
          var unkHeight = Math.min(scope.items[0].height, scope.items[1].height);
          var imgOneRatio = scope.items[0].width / scope.items[0].height;
          var imgTwoRatio = scope.items[1].width / scope.items[1].height;
          var scale = wrpWidth / ( unkHeight * imgOneRatio + unkHeight * imgTwoRatio );

          scope.imgHeight = scale * unkHeight;
          scope.flexOneWidth = scale * (unkHeight * imgOneRatio);
          scope.flexTwoWidth = scale * (unkHeight * imgTwoRatio);
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
