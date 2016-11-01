(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixeid', onScroll);

  /** @ngInject */
  function onScroll($window) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var offLeft = ($element.offset().left);

        $element.css('position', 'fixed');
        $element.css('top', '45px');
        $element.css('left', offLeft + 'px');

        $scope.$on('$routeChangeStart', function() {
          $element.css('position', '');
          $element.css('top', '');
          $element.css('left', '');
        });
      }
    };
  }

})();
