(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.scroll')
      .directive('mousewheelHorizental', mousewheelHorizental);
  
    /** @ngInject */
    function mousewheelHorizental($) {
      return {
        restrict: 'A',
        link: function (scope, $element) {
            $($element[0]).mousewheel(function(event, delta) {
                this.scrollLeft -= (delta * 30);
                event.preventDefault();
            });
          
        }
      };
    }
  
  })();
  