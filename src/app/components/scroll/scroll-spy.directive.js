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
                console.log("offset:  " + offset);
                elem.scrollspy({ "offset" : offset});
                scope.$watch(attr.scrollSpy, function(value) {
                    $timeout(function() { 
                    elem.scrollspy('refresh', { "offset" : offset})
                    }, 1);
                }, true);
            }
        }
    });

})();