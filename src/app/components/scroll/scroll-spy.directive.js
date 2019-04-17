(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollSpy', function ($timeout, _) {
      return {
        restrict: 'A',
        link: function (scope, elem, attr) {
          var eventReferences = [];
          var offset = parseInt(attr.scrollOffset, 10)
          if (!offset) offset = 10;
          elem.scrollspy({"offset": offset});
          eventReferences.push(scope.$watch(attr.scrollSpy, function () {
            $timeout(function () {
              elem.scrollspy('refresh', {"offset": offset})
            }, 1);
          }, true));

          scope.$on('$destroy', function () {
            _.forEach(eventReferences, function (canceler) {
              if (_.isFunction(canceler)) {
                canceler();
              }
            });
          });
        }
      }
    });

})();
