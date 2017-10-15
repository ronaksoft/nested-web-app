(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.scroll')
      .directive('mousewheelHorizental', mousewheelHorizental);
  
    /** @ngInject */
    function mousewheelHorizental($, $timeout) {
      return {
        restrict: 'A',
        link: function (scope, $element) {
          $timeout(function (){
            if($element[0].scrollWidth > $element[0].clientWidth){
              if(!window.nativeScroll) {
                $($element[0]).mousewheel(function(event, delta) {
                  this.scrollLeft -= (delta * 30);
                  event.preventDefault();
                });
              } 
            }          
          }, 56)
          
        }
      };
    }
  
  })();
  