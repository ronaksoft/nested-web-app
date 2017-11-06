(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('resizeHeightAnimation', resizeHeight);

  /** @ngInject */
  function resizeHeight() {
    return {
      restrict: 'A',
      link: function (scope, $el, att) {
        scope.$watch(function () {
          return att.resizeHeightAnimation
        }, function (v) {
          if (v != 'true') {
            $el.slideToggle();
          } else {
            $el.slideToggle();
          }

        })

      }
    };
  }
})();
