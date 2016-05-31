(function() {
  'use strict';

  angular
    .module('nested')
    .directive('initials', function () {
      return {
        scope: {
          initials: '=',
          url: '='
        },
        link: function (scope, element) {
          scope.$watch('initials', function (val) {
            element.initial({
              name: val
            });
          });

          scope.$watch('url', function (newVal, oldVal, scope) {
            if (newVal) {
              element.initial({
                name: scope.initials,
                src: newVal
              });
            }
          });
        }
      };
    });

})();
