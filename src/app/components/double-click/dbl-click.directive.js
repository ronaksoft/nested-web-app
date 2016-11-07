(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive(' ', fn);

  /** @ngInject */
  function fn($timeout,$location) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var timer;
        console.log($attrs.dblClick);
        if ($attrs.dblClick == 'true') {
            $element.click(function(event) {
                $timeout.cancel(timer);
                event.preventDefault();
                timer = $timeout(function() {
                    $location.url($attrs.href.substring(1));
                }, 200)
            }); 
            $element.dblclick(function(event) {
                $timeout.cancel(timer);
            }); 
        }
    
      }
    };
  }
})();
