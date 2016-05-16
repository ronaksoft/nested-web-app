(function() {
  'use strict';

  angular
    .module('nested')
    .directive('emoji', function ($compile, emoji) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          emoji: '='
        },
        link: function (scope, element) {
          element.html(emoji(scope.emoji || element.html()));
        }
      };
    });
})();
