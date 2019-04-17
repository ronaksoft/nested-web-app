(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('initials', function (_) {
      return {
        scope: {
          initials: '=',
          url: '='
        },
        link: function (scope, element) {
          var eventReferences = [];
          eventReferences.push(scope.$watch('initials', function (val) {
            element.initial({
              name: val
            });
          }));

          eventReferences.push(scope.$watch('url', function (newVal, oldVal, scope) {
            if (newVal) {
              element.initial({
                name: scope.initials,
                src: newVal
              });
            }
          }));

          scope.$on('$destroy', function () {
            _.forEach(eventReferences, function (canceler) {
              if (_.isFunction(canceler)) {
                canceler();
              }
            });
          });
        }
      };
    });

})();
