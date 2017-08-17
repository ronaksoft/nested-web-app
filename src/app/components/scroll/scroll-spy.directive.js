(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollSpy', function($timeout){
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {
                var offset = parseInt(attr.scrollOffset, 10)
                if(!offset) offset = 10;
                elem.scrollspy({ "offset" : offset});
                scope.$watch(attr.scrollSpy, function() {
                    $timeout(function() {
                    elem.scrollspy('refresh', { "offset" : offset})
                    }, 1);
                }, true);
            }
        }
    });

})();
