(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsPreviewBar', AttachmentsPreviewBar);

  function AttachmentsPreviewBar($timeout, $interval, toastr, $q,
                                 NST_ATTACHMENTS_PREVIEW_BAR_MODE, NST_ATTACHMENTS_PREVIEW_BAR_ORDER, NST_STORE_ROUTE,
                                 NstSvcStore, NstSvcFileFactory) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/preview/main.html',
      scope: {
        onItemClick: '=',
        items: '=',
        mode: '=',
        badge: '='
      },
      link: function (scope, ele) {
        scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO;
        scope.overFlowLeft = scope.overFlowRight = false;
        scope.items = setOrder(scope.items, NST_ATTACHMENTS_PREVIEW_BAR_ORDER.order);
        scope.flexDiv = 16;
        scope.scrollDis = 70;
        scope.cardWidth = angular.element('.attachments-card').width();
        var interval, pwTimeout;
        var moves = [];

        if (modeIsValid(scope.mode)) {
          scope.internalMode = scope.mode;
        }


        if (scope.internalMode === NST_ATTACHMENTS_PREVIEW_BAR_MODE.AUTO) {
          scope.internalMode = scope.badge ? NST_ATTACHMENTS_PREVIEW_BAR_MODE.BADGE : NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL;
        }

        if (scope.items.length == 1 && scope.items[0].hasPreview.length > 0) {

          scope.internalMode = NST_ATTACHMENTS_PREVIEW_BAR_MODE.THUMBNAIL_ONLY_IMAGE;

          var wrpWidth = ele.parent().parent().width();


          var imgOneRatio = scope.items[0].ratio;

          scope.width = scope.items[0].width < scope.cardWidth ? scope.items[0].width : scope.cardWidth;
          scope.height = scope.width / imgOneRatio;

          scope.wrpWidth = wrpWidth;

          if (scope.height < 96) {
            scope.height = 96;
            scope.width = scope.height * imgOneRatio;
          }

          scope.wrpHeight = scope.height;
        }

        if (scope.items.length == 2 && scope.items[0].hasPreview.length > 0 && scope.items[1].hasPreview.length > 0) {
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


        $timeout(function () {
          scope.scrollWrp = ele.children().next();
          var leftArrow = ele.children().first();
          var rightArrow = ele.children().next().next();

          checkScroll(scope.scrollWrp[0]);

          scope.scrollWrp.scroll(function () {
            checkScroll(scope.scrollWrp[0]);
          });

          rightArrow.mousedown(function () {
            scrollPower('right');
          });
          rightArrow.mouseup(function () {
            stopScrollPower();
          });

          leftArrow.mousedown(function () {
            scrollPower('left');
          });
          leftArrow.mouseup(function () {
            stopScrollPower();
          });

        }, 1000);


        // interaction functions
        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item, scope.items);
          }
        };


        scope.download = function (item) {
          if (item.downloadUrl) {
            location.href = item.downloadUrl;
            return;
          }

          getToken(item.id).then(function (token) {
            item.downloadUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, item.id, token);
            item.viewUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, item.id, token);

            location.href = item.downloadUrl;
          }).catch(function (error) {
            toastr.error('Sorry, An error has occured while trying to load the file');
          });
        };

        function getToken(id) {
          var deferred = $q.defer();

          NstSvcFileFactory.getDownloadToken(id).then(deferred.resolve).catch(deferred.reject).finally(function () {
          });

          return deferred.promise;
        }

        scope.goLeft = function () {
          var k = makeid();
          var count = {};
          count[k] = 0;
          scrollLeft(count[k]);
        };

        scope.goRight = function () {
          var k = makeid();
          var count = {};
          count[k] = 0;
          scrollRight(count, k);
        };

        function scrollLeft(count) {
          var el = scope.scrollWrp[0];
          var i = $interval(function () {
            count++;
            if (count < scope.scrollDis) {
              el.scrollLeft -= 2;
            } else {
              $interval.cancel(i);
            }
          }, 1);
          moves.push(i);
        }

        function scrollRight(count, k) {
          var el = scope.scrollWrp[0];
          var i = $interval(function () {
            count[k]++;
            if (count[k] < scope.scrollDis) {
              el.scrollLeft += 2;
            } else {
              $interval.cancel(i);
            }
          }, 1);
          moves.push(i);

        }

        function checkScroll(el) {
          if (el.clientWidth < el.scrollWidth && el.scrollLeft == 0) {
            scope.overFlowRight = true;
            scope.overFlowLeft = false;
            return stopScrollPower()
          } else if (el.clientWidth + el.scrollLeft >= el.scrollWidth && el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = false;
            scope.overFlowLeft = true;
            return stopScrollPower()
          } else if (el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = true;
            scope.overFlowLeft = true;
            return 'atMiddle'
          }
        }

        function scrollPower(dir) {
          pwTimeout = $timeout(function () {
            if (dir == 'right') {
              interval = $interval(function () {
                scope.goRight()
              }, 100);
            }
            else {
              interval = $interval(scope.goLeft, 100);
            }
          }, 50)
        }

        function stopScrollPower() {
          $timeout.cancel(pwTimeout);
          $interval.cancel(interval);

          for (var i = 0; i < moves.length; i++) {
            $interval.cancel(moves[i]);
          }
          moves = []
        }

      }
    };
    function makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
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
      for (var i = 0; i < items.length; i++) {
        var index = orderMap.indexOf(items[i].type);
        if (index > -1) {
          items[i]['order'] = index;
        } else {
          items[i]['order'] = 999;
        }
      }
      return items;
    }
  }
})();
