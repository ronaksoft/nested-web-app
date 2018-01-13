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
          var listener = scope.$watch(function () {
            return $element[0].scrollWidth;
          }, function (newVal) {
            if(newVal > $element[0].clientWidth){
              if(!window.nativeScroll) {
                $($element[0]).mousewheel(function(event, delta) {
                  this.scrollLeft -= (delta * 30);
                  event.preventDefault();
                });
              } 
            }
          });
          scope.$on('$destroy', function () {
            listener();
          });
          
        }
      };
    }
  
  })();
  