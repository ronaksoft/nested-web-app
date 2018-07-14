(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('resizeHeightAnimation', resizeHeight);

  /** @ngInject */
  function resizeHeight(_) {
    return {
      restrict: 'A',
      link: function (scope, $el, att) {
        var eventReferences = [];

        $el.slideToggle();
        eventReferences.push(scope.$watch(function () {
          return att.resizeHeightAnimation
        }, function (v) {
          if (v == 'true') {
            $el.slideDown();
          } else if (v == 'false') {
            $el.slideUp();
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
  }
})();
