(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('sidebarScroll', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,$timeout,$interval) {
    return {
      restrict: 'A',
      link: function (scope, $element, $attrs) {
          var placesArray = [];
          var unreadArray = [];
          scope.ctlSidebar.overFlowBottom = false;
          scope.ctlSidebar.overFlowBottomUnread = false;
          scope.ctlSidebar.overFlowTop = false;
          scope.ctlSidebar.overFlowTopUnread = false;

          // Hell handle on promise resolving
          $timeout(function(){
              initControlls();
          },500);

            function checkScroll(el) {

                // Toggle Buttons
                if (el.clientHeight < el.scrollHeight && el.scrollTop <= 16) {
                    scope.ctlSidebar.overFlowBottom = true;
                    scope.ctlSidebar.overFlowTop = false;
                } else if (el.clientHeight < el.scrollHeight && el.clientHeight + el.scrollTop >= el.scrollHeight - 16) {
                    scope.ctlSidebar.overFlowBottom = false;
                    scope.ctlSidebar.overFlowTop = true;
                } else if (el.clientHeight < el.scrollHeight) {
                    scope.ctlSidebar.overFlowBottom = true;
                    scope.ctlSidebar.overFlowTop = true;
                }

                // Toggle badge visibility
                if ( scope.ctlSidebar.overFlowTop ) {
                    var scrolledIndex = Math.floor((el.scrollTop - 16) / 64);
                    var UnreadCountsT = 0;

                    for (var i = 0;i <= scrolledIndex; i++){
                        if ( placesArray[i] === 1 ) {
                            ++UnreadCountsT;
                        }
                    }
                    if ( UnreadCountsT > 0){
                        scope.ctlSidebar.overFlowTopUnread = true;
                    } else {
                        scope.ctlSidebar.overFlowTopUnread = false;
                    }
                }

                if ( scope.ctlSidebar.overFlowBottom ) {
                    var notScrolled = el.scrollHeight - el.clientHeight - el.scrollTop;
                    var notScrolledIndex = Math.floor((notScrolled - 16 - 64) / 64);
                    var UnreadCountsB = 0;

                    for (var j = 0;j <= notScrolledIndex; j++){
                        if ( placesArray[placesArray.length - j - 1] === 1 ) {
                            ++UnreadCountsB;
                        }
                    }

                    if ( UnreadCountsB > 0){
                        scope.ctlSidebar.overFlowBottomUnread = true;
                    } else {
                        scope.ctlSidebar.overFlowBottomUnread = false;
                    }
                }
            }
          
          function initControlls() {
            insertItems();
            checkScroll($element[0]);
          }

          function insertItems() {
              for( var i = 0; i < scope.ctlSidebar.places.length; i++) {
                  if ( scope.ctlSidebar.places[i].unreadPosts > 0 ) {
                      placesArray.push(1);
                  } else {
                      placesArray.push(0);
                  }
              }
          }
          
          $element.scroll(function () {
            checkScroll($element[0]);
          });

          scope.ctlSidebar.scrollTop = function(){
            var scrollDis = $element[0].clientHeight - 80;
            var i = 0;
            var inter = $interval(function () {
                if (i < scrollDis) {
                    $element[0].scrollTop -= 2;
                } else {
                    $interval.cancel(inter);
                }
                i += 2;
            });
          };
          scope.ctlSidebar.scrollBottom = function(){
            var scrollDis = $element[0].clientHeight - 80;
            var i = 0
            var inter = $interval(function () {
                if (i < scrollDis) {
                    $element[0].scrollTop += 2;
                } else {
                $interval.cancel(inter);
                }
                i += 2;
            });
          };

          $rootScope.$on('init-controls-sidebar',function(){
              insertItems();
          });

      }
    };
  }

})();
