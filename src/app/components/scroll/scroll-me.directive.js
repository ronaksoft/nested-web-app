(function() {
  'use strict';

  angular
    .module('nested')
    .directive('scrollMe', function($timeout) {
      return {
        scope: { trigger: '@scrollMe' },
        link: function(scope, element) {
          scope.$watch('trigger', function(value) {
              if (value === "true"){
                $timeout(function() {
                  element[0].scrollTop = element[0].scrollHeight;
                },1000);
              }
          });
        }
      };
    });
})();
