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
                $element[0].scrollLeft = $element[0].scrollWidth - $element.outerWidth();
            };
            $($element[0]).scroll(function(event, delta) {
                console.log('mousewheel',arguments);
                this.scrollLeft -= (delta * 30);
            
                event.preventDefault();
        
            });
          
        }
      };
    }
  
  })();
  