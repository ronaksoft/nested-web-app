(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('onScroll', onScroll);

  /** @ngInject */
  function onScroll() {
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
