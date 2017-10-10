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
        el.addEventListener('keydown', resize);
        function resize() {
          var ele = $el[0];
          ele.style.height = '';
          ele.style.height = ele.scrollHeight + "px";
        }
        scope.$on('$destroy', function () {
          el.removeEventListener('keydown', resize);
        });
      }
    };
  }
})();
