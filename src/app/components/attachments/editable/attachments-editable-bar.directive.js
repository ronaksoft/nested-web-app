(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsEditableBar', AttachmentsEditableBar);

  function AttachmentsEditableBar(NST_ATTACHMENTS_EDITABLE_BAR_MODE, $timeout, $interval) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/editable/main.html',
      scope: {
        onItemDelete: '=',
        onItemClick: '=',
        items: '=',
        mode: '='
      },
      link: function (scope, ele, attributes) {

        scope.overFlowLeft = scope.overFlowRight = false;
        scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.AUTO;
        scope.scrollWrp = ele.children().next();
        var pwTimeout, interval;
        var moves = [];
        scope.scrollDis = 70;

        if (modeIsValid(attributes.mode)) {
          scope.internalMode = attributes.mode;
        }

        scope.$watch(function () {
          return scope.items.length;
        },function () {
          checkImageRatio(scope.items);
          $timeout(function () {
            checkScroll(scope.scrollWrp[0]);
          },1000);
        });

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

        if (scope.internalMode === NST_ATTACHMENTS_EDITABLE_BAR_MODE.AUTO) {
          if (_.some(scope.items, 'hasThumbnail')) {
            scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.THUMBNAIL;
          } else {
            scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.BADGE;
          }
        }

        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item);
          }
          $timeout(function () {
            checkScroll(scope.scrollWrp[0]);
          }, 500);
        };

        scope.onDelete = function (item) {
          if (scope.onItemDelete) {
            scope.onItemDelete(item);
          }
        };

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
          checkImageRatio();
        }
      }
    };

    function checkImageRatio() {
      var imageElement = angular.element(".thumbnail-bar img");
      for (var i = 0 ; i < imageElement.length; i++){
        angular.element(imageElement[i]).parents('li').width(angular.element(imageElement[i]).width());
      }

    }

    function modeIsValid(mode) {
      return _.values(NST_ATTACHMENTS_EDITABLE_BAR_MODE).indexOf(mode) > -1;
    }

    function makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
  }
})();
