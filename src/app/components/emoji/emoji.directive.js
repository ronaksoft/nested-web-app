(function() {
  'use strict';

  angular
    .module('nested')
    .directive('emoji', function (emoji) {
      return {
        restrict: 'EA',
        replace: true,
        link: function (scope, elem) {
          emoji(elem);
        }
      };
    });
})();
