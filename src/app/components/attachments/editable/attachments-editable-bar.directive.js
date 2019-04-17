(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsEditableBar', AttachmentsEditableBar);

  function AttachmentsEditableBar(NST_ATTACHMENTS_EDITABLE_BAR_MODE, $timeout, $interval, _, $, NST_FILE_TYPE, $rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/editable/main.html',
      scope: {
        onItemDelete: '=',
        onItemClick: '=',
        items: '=',
        mode: '=',
        removeItem: '=?'
      },
      link: function (scope, ele) {
        var eventReferences = [];
        if (scope.removeItem === undefined) {
          scope.removeItem = true;
        }
        scope.overFlowLeft = scope.overFlowRight = false;
        scope.getThumbnail = getThumbnail;
        scope.badge = false;
        scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.AUTO;
        scope.scrollWrp = ele.children().next();
        var borderLeftArray = [],
          borderRightArray = [];
        scope.scrollDis = 140;

        if (modeIsValid(scope.mode)) {
          scope.internalMode = scope.mode;
        } else {
          scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.THUMBNAIL
        }
        if (scope.mode === NST_ATTACHMENTS_EDITABLE_BAR_MODE.BADGE) {
          scope.badge = true;
        }

        if (!scope.badge) {
          $timeout(function () {
            // var leftArrow = ele.children().first();
            // var rightArrow = ele.children().next().next();
            scope.scrollWrp = ele.children().next();
            checkScroll(scope.scrollWrp[0]);
            checkArrays(scope.scrollWrp[0]);
            scope.scrollWrp.scroll(function () {
              checkScroll(scope.scrollWrp[0]);
            });
            checkImageRatio();
            eventReferences.push(scope.$watch(function () {
              return scope.items.length;
            }, function () {
              $timeout(function () {
                checkImageRatio();
              }, 300);

              $timeout(function () {
                checkScroll(scope.scrollWrp[0]);
                checkArrays(scope.scrollWrp[0]);
              }, 1000);
            }));
          }, 100);
        }

        function getThumbnail(item, size) {
          if (item.thumbnail && item.thumbnail.length > 0) {
            return item.thumbnail
          } else {
            if (item.type === NST_FILE_TYPE.AUDIO || item.type === NST_FILE_TYPE.VIDEO) {
              if (size) {
                return '/assets/icons/ph_small_attachment_media@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_media.png';
              }
            } else if (item.type === NST_FILE_TYPE.ARCHIVE) {
              if (size) {
                return '/assets/icons/ph_small_attachment_zip@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_zip.png';
              }
            } else if (item.type === NST_FILE_TYPE.DOCUMENT) {
              if (size) {
                return '/assets/icons/ph_small_attachment_document@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_document.png';
              }
            } else if (item.type === NST_FILE_TYPE.PDF) {
              if (size) {
                return '/assets/icons/ph_small_attachment_pdf@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_pdf.png';
              }
            } else {
              if (size) {
                return '/assets/icons/ph_small_attachment_other@2x.png';
              } else {
                return '/assets/icons/ph_small_attachment_other.png';
              }
            }
          }
        }

        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item);
          }
          if (!scope.badge) {
            $timeout(function () {
              checkScroll(scope.scrollWrp[0]);
            }, 500);
          }
        };

        scope.onDelete = function (item) {
          if (scope.onItemDelete) {
            scope.onItemDelete(item);
          }
        };

        scope.goLeft = function () {
          var el = scope.scrollWrp[0];
          var i = 0;

          var scrollDis = findBefore(el.scrollLeft);
          var inter = $interval(function () {
            if (i < scrollDis) {
              el.scrollLeft -= 4;
            } else {
              $interval.cancel(inter);
            }
            i = i + 4;
          }, 1);
        };

        scope.goRight = function () {
          var el = scope.scrollWrp[0];
          var i = 0;
          var scrollDis = findNext(el.scrollLeft + el.clientWidth);
          var inter3 = $interval(function () {
            if (i < scrollDis + 16) {
              el.scrollLeft += 4;
            } else {
              $interval.cancel(inter3);
            }
            i = i + 4;
          }, 1);
        };

        function checkScroll(el) {
          // console.log('checkScroll', el.clientWidth < el.scrollWidth, el.scrollLeft, el.clientWidth, el.clientWidth);
          if (el.clientWidth < el.scrollWidth && el.scrollLeft == 0) {
            scope.overFlowRight = true;
            scope.overFlowLeft = false;
          } else if (el.clientWidth + el.scrollLeft >= el.scrollWidth && el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = false;
            scope.overFlowLeft = true;
          } else if (el.clientWidth < el.scrollWidth) {
            scope.overFlowRight = true;
            scope.overFlowLeft = true;
          }



        }

        function checkArrays(el) {
          var childs = $(el).children();

          var borderLeftArrayTemp = [];
          var borderRightArrayTemp = [];
          for (var i = 0; i < childs.length; i++) {
            var paddingSize = (i + 1) === childs.length ? 0 : 16
            var leftborderPosition = childs[i].offsetLeft + el.scrollLeft - paddingSize;
            var paddingSize2 = $rootScope._direction === 'rtl' ? 0 : 16;
            borderLeftArrayTemp.push(leftborderPosition);
            borderRightArrayTemp.push(childs[i].offsetLeft + childs[i].offsetWidth + el.scrollLeft - paddingSize2);
            if($rootScope._direction === 'rtl') {
              borderLeftArrayTemp.sort(function (a,b) {
                return a - b;
              })
              borderRightArrayTemp.sort(function (a,b) {
                return a - b;
              })
            }
          }

          //using temp to prevent bug in counting duration
          borderLeftArray = borderLeftArrayTemp;
          borderRightArray = borderRightArrayTemp;
        }

        function checkImageRatio() {
          for (var i = 0; i < scope.items.length; i++) {
            var elem = document.createElement("img");
            elem.src = scope.items[i].thumbnail;
            scope.items[i].width = elem.width ? elem.width : 80;
            scope.items[i].height = elem.height ? elem.height : 80;
            var ratio = scope.items[i].width / scope.items[i].height;
            scope.items[i].widthResized = 96 * ratio;
          }

        }

        function findNext(numb) {
          return borderRightArray.filter(function (i) {
            return i > numb
          })[0] - numb
        }

        function findBefore(numb) {
          var filter = borderLeftArray.filter(function (i) {
            return i < numb
          });
          return numb - filter[filter.length - 1]
        }

        scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }
    };

    function modeIsValid(mode) {
      return _.values(NST_ATTACHMENTS_EDITABLE_BAR_MODE).indexOf(mode) > -1;
    }
  }
})();
