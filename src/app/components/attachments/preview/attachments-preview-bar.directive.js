(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar(NST_ATTACHMENTS_PREVIEW_BAR_MODE, NST_ATTACHMENTS_PREVIEW_BAR_ORDER,$timeout,$interval) {
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
        scope.flexDiv = 16;
        scope.scrollDis = 70;
        var interval,pwTimeout;

        // if (modeIsValid(scope.mode)) {
        //   scope.internalMode = scope.mode;
        // }

        if (scope.internalMode === NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO){
          if (_.some(scope.items, 'hasThumbnail')) {
            scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL;
          } else {
            scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.BADGE;
          }
        }
        if ( scope.items.length == 1 && scope.items[0].hasPreview.length > 0 ) {

          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_ONLY_IMAGE;

          var wrpWidth = ele.parent().parent().width();


          var imgOneRatio = scope.items[0].ratio;

          scope.width = wrpWidth ;
          scope.height = wrpWidth * imgOneRatio
        }

        if ( scope.items.length == 2 && scope.items[0].hasPreview.length > 0 && scope.items[1].hasPreview.length > 0 ) {
          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_TWO_IMAGE;


          var wrpWidth = ele.parent().parent().width() - scope.flexDiv;
          var unkHeight = Math.min(scope.items[0].height, scope.items[1].height);
          var imgOneRatio = scope.items[0].ratio;
          var imgTwoRatio = scope.items[1].ratio;
          var scale = wrpWidth / ( unkHeight * imgOneRatio + unkHeight * imgTwoRatio );

          scope.imgHeight = scale * unkHeight;
          scope.flexOneWidth = scale * (unkHeight * imgOneRatio);
          scope.flexTwoWidth = scale * (unkHeight * imgTwoRatio);
        }






        $timeout( function () {
          scope.scrollWrp = ele.children().next();
          var leftArrow = ele.children().first();
          var rightArrow = ele.children().next().next();

          checkScroll(scope.scrollWrp[0]);

          scope.scrollWrp.scroll(function(){
            checkScroll(scope.scrollWrp[0]);
          });

          rightArrow.mousedown(function(){
            scrollPower('right');
          });
          rightArrow.mouseup(function(){
            stopScrollPower();
          });

          leftArrow.mousedown(function(){
            scrollPower('left');
          });
          leftArrow.mouseup(function(){
            stopScrollPower();
          });
          leftArrow.mouseout(function(){
            stopScrollPower();
          });

        },1000 );




        // interaction functions
        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item, scope.items);
          }
        };
        scope.dlClick = function (item) {
          //Download it
        };

        scope.goLeft = function () {
          var k = makeid();
          var count =  {};
          count[k] = 0;
          scrollLeft(count[k]);
        };

        scope.goRight = function () {
          var k = makeid();
          var count =  {};
          count[k] = 0;
          scrollRight(count[k]);
        };

        function scrollLeft(count) {
          var el = scope.scrollWrp[0];
          ++count;
          if( count < scope.scrollDis  ) { $timeout (function () {
            el.scrollLeft -= 2;
            scrollLeft(count);
          },1)
          } else {
            checkScroll(el)
          }
        }
        function scrollRight(count) {
          var el = scope.scrollWrp[0];
          ++count;
          if( count < scope.scrollDis ) { $timeout (function () {
            el.scrollLeft += 2;
            scrollRight(count);
          },1)
          } else {
            checkScroll(el)
          }
        }
        function checkScroll(el) {
          if (el.clientWidth < el.scrollWidth && el.scrollLeft == 0) {
            scope.overFlowRight = true;
            scope.overFlowLeft = false;
            return 'atFirst'
          } else if(el.clientWidth + el.scrollLeft > el.scrollWidth - 5 && el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = false;
            scope.overFlowLeft = true;
            return 'atEnd'
          } else if ( el.clientWidth < el.scrollWidth ) {
            scope.overFlowRight = true;
            scope.overFlowLeft = true;
            return 'atMiddle'
          }
        }

        function scrollPower(dir) {
          stopScrollPower();
          pwTimeout = $timeout(function () {
            if ( dir == 'right' ) {
              interval = $interval(scope.goRight, 20);
            }
            else {
              interval = $interval(scope.goLeft, 20);
            }
          },50)
        }
        function stopScrollPower() {
          $timeout.cancel(pwTimeout);
          $interval.cancel(interval);
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
