(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.scroll')
      .directive('topbarScrollbar', topbarScroll);
  
    /** @ngInject */
    function topbarScroll($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, $element) {
            scope.scrollEndSearch = function(){
              setTimeout(function (){
                if ($rootScope._direction === 'rtl') {
                  $element.stop().animate({scrollLeft: 0}, 200, 'swing')
                } else {
                  $element.stop().animate({scrollLeft: $element[0].scrollWidth - $element.outerWidth()}, 200, 'swing')
                }             
              },300)
            };
          
        }
      };
    }
  
  })();
  