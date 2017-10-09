(function() {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.sidebar')
      .directive('scrollIntoView', fn);
  
    /** @ngInject */
    function fn($timeout) {
      return {
        restrict: 'A',
        link: function ($scope, $el, $attr) {
            var timeout;
  
          $timeout(function() {
            $scope.$watch(function (){
                return $scope.ctlSidebar.scrollIntoViewEvent;
            }, function (n) {
                if ( n && n.currentTarget) {
                    $timeout.cancel(timeout);
                    timeout = $timeout(function (){
                        scroller(n.currentTarget);
                    },300)
                }
            })
          },100);

          function scroller(el){
              var parentListItem = $(el).parents($attr.scrollIntoView)[0]
              if (!parentListItem) {
                  return
              }
              var needToTrailBottom;
              if ( window.nativeScroll) {
                needToTrailBottom = (parentListItem.offsetTop + parentListItem.clientHeight) - ($el[0].clientHeight + $el[0].scrollTop)
              } else {
                needToTrailBottom = (parentListItem.offsetTop + parentListItem.clientHeight) - ($scope.scrollInstance.wrapperHeight - $scope.scrollInstance.y)
              }
              console.log($el, parentListItem.offsetTop , parentListItem.clientHeight, $el[0].scrollHeight , $el[0].scrollTop);
            //   var needToTrailTop = $(parentListItem).offset().top - $(el).offset().top > $scope.scrollInstance.y;
            if ( needToTrailBottom > 0) {
              if ( window.nativeScroll) {
                $el[0].scrollTop += needToTrailBottom + 16;
              } else {
                $scope.scrollInstance.scrollBy(0, -1 * needToTrailBottom - 16);
              }
            }
          }

  
        }
      };
    }
  })();
  