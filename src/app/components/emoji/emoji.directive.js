(function() {
  'use strict';

  angular
    .module('nested')
    .directive('emoji', function ($compile, $templateRequest, emoji) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          emoji: '=',
          src: '='
        },
        link: function (scope, element, attrs) {
          set(scope.emoji || element.html() || '');

          scope.$watch(function () { return element.html(); }, set);

          if (attrs.emoji) {
            scope.$watch('emoji', set);
          }

          if (attrs.src) {
            scope.$watch('src', function (src) {
              $templateRequest(src, true).then(function (response) {
                set(response);
              }, function () {
                set('');
                scope.$emit('$emojiIncludeError', attrs.src);
              });
            });
          }

          function set(text) {
            element.html(emoji(text));
            // $compile(element.contents())(scope.$parent);
          }
        }
      };
    });
})();
