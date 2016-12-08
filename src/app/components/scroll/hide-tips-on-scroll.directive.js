(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('hideTips', hideTips);

  /** @ngInject */
  function hideTips($timeout) {
    return {
      scope: {
        onscroll: '&'
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
