(function() {
  'use strict';

  angular
    .module('nested')
    .directive('initials', function () {
      return {
        scope: {
          initials: '='
        },
        link: function (scope, element) {
          scope.$watch('initials', function (val) {
            element.initial({
              name: val,
              seed: 15
            });
          });
        }
      };
    });

})();
