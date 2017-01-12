(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar(NST_ATTACHMENTS_PREVIEW_BAR_MODE, NST_ATTACHMENTS_PREVIEW_BAR_ORDER,$timeout) {
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
        scope.overFlowLeft = scope.overFlowRight = false;
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


        $timeout( function () {
          checkScroll(ele[0].children[1]);
        },1000 );

        function checkScroll(el) {
          scope.scrollWrp = el;
          if (el.clientWidth < el.scrollWidth && el.scrollLeft == 0) {
            scope.overFlowRight = true;
            scope.overFlowLeft = false;
          } else if(el.clientWidth + el.scrollLeft == el.scrollWidth && el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = false;
            scope.overFlowLeft = true;
          } else if ( el.clientWidth < el.scrollWidth ) {
            scope.overFlowRight = true;
            scope.overFlowLeft = true;
          }
        }


        scope.goLeft = function (e) {
          e.stopPropagation();
          var k = makeid();
          var count =  {};
          count[k] = 0;
          scrollLeft(count[k]);
        };
        function scrollLeft(count) {
          var el = scope.scrollWrp;
          ++count;
          if( count < 70 ) { $timeout (function () {
            el.scrollLeft -= 1;
            scrollLeft(count);
          },1)
          } else {
            checkScroll(el)
          }
        }

        scope.goRight = function (e) {
          e.stopPropagation();
          var k = makeid();
          var count =  {};
          count[k] = 0;
          scrollRight(count[k]);
        };
        function scrollRight(count) {
          var el = scope.scrollWrp;
          ++count;
          if( count < 70 ) { $timeout (function () {
            el.scrollLeft += 1;
            scrollRight(count);
          },1)
          } else {
            checkScroll(el)
          }
        }

      }
    };
    function makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
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
