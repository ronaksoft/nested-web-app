(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.scroll')
      .directive('topbarScrollbar', topbarScroll);
  
    /** @ngInject */
    function topbarScroll($) {
      return {
        restrict: 'A',
        link: function (scope, $element) {
            scope.scrollEndSearch = function(){
              setTimeout(function (){
                $element.stop().animate({scrollLeft: $element[0].scrollWidth - $element.outerWidth()}, 200, 'swing')                
              },300)
                // $element[0].scrollLeft = $element[0].scrollWidth - $element.outerWidth();
            };
            $($element[0]).mousewheel(function(event, delta) {
                this.scrollLeft -= (delta * 30);
                event.preventDefault();
        
            });
          
        }
      };
    }
  
  })();
  