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
        var resizeTextare = _.debounce(resize, 100);
        console.log('aaa', angular.element(el), el, resizeTextare);
        function resize(el) {
          var el = $el[0];
          console.log('resize', el)
          el.style.height = '';
          el.style.height = el.scrollHeight + "px";
        }
        scope.$on('$destroy', function () {
          el.removeEventListener('keydown', resizeTextare);
        });
      }
    };
  }
})();
