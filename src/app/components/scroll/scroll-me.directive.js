(function() {
  'use strict';

  angular
    .module('nested')
    .directive('scrollMe', function($timeout) {
      return {
        scope: { scrollMe: '=' },
        link: function(scope, element, attrs) {
          scope.$watch('scrollMe', function(value) {
            if (value) {
              $timeout(function() {
                scope.scrollMe = false;
                angular.element(element[0]).animate({scrollTop: element[0].scrollHeight}, '500', 'swing');
              },300)
            }
          });
        }
      };
    });
})();
