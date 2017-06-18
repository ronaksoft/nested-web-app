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

        function checkScroll() {
            var el = $element[0];
            // Toggle Buttons
            if (el.clientHeight >= el.scrollHeight) {
                scope.ctlSidebar.overFlowBottom = false;
                scope.ctlSidebar.overFlowTop = false;
            } else if (el.scrollTop <= 28) {
                scope.ctlSidebar.overFlowBottom = true;
                scope.ctlSidebar.overFlowTop = false;
            } else if (el.clientHeight + el.scrollTop >= el.scrollHeight - 28) {
                scope.ctlSidebar.overFlowBottom = false;
                scope.ctlSidebar.overFlowTop = true;
            } else {
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
