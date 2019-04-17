(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('resizeTextarea', resizeTextarea);

  /** @ngInject */
  function resizeTextarea(_) {
    return {
      restrict: 'A',
      link: function (scope, $el) {
        var el = $el[0];
        var eventDebounce = _.debounce(resize, 10);
        eventDebounce();
        el.addEventListener('keydown', eventDebounce);
        function resize() {
          var ele = $el[0];
          ele.style.height = '';
          if(ele.scrollHeight > 0) {
            ele.style.height = ele.scrollHeight + "px";
          }
        }
        scope.$on('$destroy', function () {
          eventDebounce.cancel();
          el.removeEventListener('keydown', eventDebounce);
        });
      }
    };
  }
})();
