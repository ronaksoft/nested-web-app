(function () {
  'use strict';

  angular
    .module('nested')
    .directive('onScroll', onScroll);

  /** @ngInject */
  function onScroll($timeout) {
    return {
      scope: {
        onScroll: '&'
      },
      link: function (scope, element) {
        function scrollHandler(event) {
          scope.onScroll({'event': event});
        }

        element.on("scroll", scrollHandler);

        scope.$on('$destroy', function () {
          element.off('scroll', scrollHandler);
        });
      }
    };
  }

})();
