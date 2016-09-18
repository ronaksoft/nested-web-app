(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('emoji', function ($compile, $templateRequest, emoji) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          emoji: '=',
          src: '='
        },
        compile: function(tElem, tAttrs){
          return {
            pre: function(scope, iElem, iAttrs){
            },
            post: function(scope, iElem, iAttrs){
              iElem.html(emoji(iElem.html()));
            }
          }
        }

      };
    });
})();
