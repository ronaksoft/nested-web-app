(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('fix16px', onScroll);

  /** @ngInject */
  function onScroll($window) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var offLeft = ($element.offset().left);
        var width = ($element.width());

        $element.css('position', 'fixed');
        $element.css('top', '16px');
        $element.css('left', offLeft + 'px');
        $element.css('width', width + 'px');
      }
    };
  }

})();
