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
          scope.ctlSidebar.overFlowBottom = false;
          scope.ctlSidebar.overFlowTop = false;
            function checkScroll(el) {
                if (el.clientHeight < el.scrollHeight && el.scrollTop <= 20) {
                    scope.ctlSidebar.overFlowBottom = true;
                    scope.ctlSidebar.overFlowTop = false;
                } else if (el.clientHeight < el.scrollHeight && el.clientHeight + el.scrollTop >= el.scrollHeight - 20) {
                    scope.ctlSidebar.overFlowBottom = false;
                    scope.ctlSidebar.overFlowTop = true;
                } else if (el.clientHeight < el.scrollHeight) {
                    scope.ctlSidebar.overFlowBottom = true;
                    scope.ctlSidebar.overFlowTop = true;
                }
            }
            $element.scroll(function () {
                checkScroll($element[0]);
            });
          checkScroll($element[0]);
          scope.ctlSidebar.scrollTop = function(){
              
              var scrollDis = $element[0].clientHeight - 80;
              var i = 0
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
              })
          }

      }
    };
  }

})();
