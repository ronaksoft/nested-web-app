(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('navAffixer', onScroll);

  /** @ngInject */
  function onScroll($window) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);
        var topOffset = 72;
        var offLeft = ($element.offset().left);
        var offTop = ($element.offset().top);
        var width = ($element.width());

        function affixElementC() {


          if ($window.pageYOffset > topOffset) {
            $element.css('position', 'fixed');
            $element.css('top', offTop - 72 + 'px');
            $element.css('left', offLeft + 'px');
            $element.css('width', width + 'px');
          } else {
            $element.css('position', 'absolute');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('width', '');
          }
        }

        $scope.$on('$routeChangeStart', function() {
          win.unbind('scroll', affixElementC);
        });
        win.bind('scroll', affixElementC);
      }
    };
  }

})();
