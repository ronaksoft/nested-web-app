(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('enterKey', enterKey);

  /** @ngInject */
  function enterKey(_) {
    return {
      restrict: 'A',
      link: function (scope, $el, $attrs) {
        var el = $el[0];
        var enterFnThrottle = _.throttle(enterFn, 10)
        el.addEventListener('keydown', enterFnThrottle);

        function enterFn(e) {
          if ((e.which === 13 && !e.shiftKey) || ( $attrs.preventShiftEnter == 'true' && e.which === 13 )) {
            if ($attrs.enterKey) {
              scope.$apply($attrs.enterKey);
            }
            e.preventDefault();
          }
        }
        scope.$on('$destroy', function () {
          el.removeEventListener('keydown', enterFnThrottle);
        });
      }
    };
  }
})();
