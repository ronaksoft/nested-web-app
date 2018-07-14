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

        eventReferences.push(scope.$watch(function () {
          return att.resizeHeightAnimation
        }, function (v) {
          if (v !== true) {
            $el.slideToggle();
          } else {
            $el.slideToggle();
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
