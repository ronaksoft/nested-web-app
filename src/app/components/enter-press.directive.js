(function() {
  'use strict';

  angular.module('ronak.nested.web.components').directive('enterPress', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.enterPress);
          });

          event.preventDefault();
        }
      });
    };
  });

})();
