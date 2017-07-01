(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('sidebarScroll', onScroll);

  /** @ngInject */
  function onScroll(_, $rootScope, $timeout, $interval, $window) {
    return {
      restrict: 'A',
      link: function (scope, $element, $attrs) {
        var placesArray = [],
            unreadArray = [],
            win = angular.element($window);
        scope.ctlSidebar.overFlowBottom = false;
        scope.ctlSidebar.overFlowBottomUnread = false;
        scope.ctlSidebar.overFlowTop = false;
        scope.ctlSidebar.overFlowTopUnread = false;

        win.on("resize", checkScroll);

        // Hell handle on promise resolving
        $timeout(function(){
            initControlls();
        },500);

        //TODO : reduce the cyclomatic complexity !
        function checkScroll() {
            var el = $element[0],
                ch = el.clientHeight,
                sh = el.scrollHeight,
                st = el.scrollTop,
                ih = 48;
            // Toggle Buttons
            if ( ch > sh - 8 ) {
                scope.ctlSidebar.overFlowBottom = false;
                scope.ctlSidebar.overFlowTop = false;
            } else if ( st <= 28 ) {
                scope.ctlSidebar.overFlowBottom = true;
                scope.ctlSidebar.overFlowTop = false;
            } else if ( ch + st >= sh - 28 ) {
                scope.ctlSidebar.overFlowBottom = false;
                scope.ctlSidebar.overFlowTop = true;
            } else {
                scope.ctlSidebar.overFlowBottom = true;
                scope.ctlSidebar.overFlowTop = true;
            }
            // Toggle badge visibility
            var scrolledIndex = Math.floor((st - 16) / ih),
                UnreadCountsT = 0,
                i = 0;
            for (i; i <= scrolledIndex; i++){
                if ( placesArray[i] === 1 ) {
                    ++UnreadCountsT;
                }
            }
            scope.ctlSidebar.overFlowTopUnread = UnreadCountsT > 0;

            var notScrolled = sh - ch - st,
                notScrolledIndex = Math.floor((notScrolled - 16 - ih) / ih), // Remove last item ( create place )
                UnreadCountsB = 0,
                j = 0;

            for (j; j <= notScrolledIndex; j++){
                if ( placesArray[placesArray.length - j - 1] === 1 ) {
                    ++UnreadCountsB;
                }
            }

            scope.ctlSidebar.overFlowBottomUnread = UnreadCountsB > 0;
        }
          
        function initControlls() {
            insertItems();
        }

        function insertItems() {
          placesArray = [];

          if (scope.ctlSidebar.invitations) {
            for (var i = 0; i < scope.ctlSidebar.invitations.length; i++) {
              placesArray.push(0);
            }
          }

          for (var i = 0; i < scope.ctlSidebar.places.length; i++) {
            if (scope.ctlSidebar.placesNotifCountObject[scope.ctlSidebar.places[i].id]) {
              placesArray.push(1);
            } else {
              placesArray.push(0);
            }
          }
          checkScroll($element[0]);
        }

        $element.scroll(function () {
          checkScroll($element[0]);
        });

        scope.ctlSidebar.scrollTop = function(){
            var scrollDis = $element[0].clientHeight - 80;
            var i = 0;
            var inter = $interval(function () {
                if (i < scrollDis) {
                    $element[0].scrollTop -= 4;
                } else {
                    $interval.cancel(inter);
                }
                i += 4;
            },1);
        };
        
        scope.ctlSidebar.scrollBottom = function(){
            var scrollDis = $element[0].clientHeight - 80;
            var i = 0
            var inter = $interval(function () {
                if (i < scrollDis) {
                    $element[0].scrollTop += 4;
                } else {
                $interval.cancel(inter);
                }
                i += 4;
            },1);
        };

        scope.ctlSidebar.insertItems = insertItems;

      }
    };
  }

})();
