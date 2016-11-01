(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixer72', onScroll);

  /** @ngInject */
  function onScroll($window) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);
        var topOffset = 72;
        var offLeft = ($element.offset().left);
        var height = ($element.height());
        var width = ($element.width());
        
        function affixElement() {

          console.log();

          if ($window.pageYOffset > topOffset) {
            $element.css('position', 'fixed');
            $element.css('top', '-72px');
            $element.css('left', offLeft + 'px');
            $element.css('width', width + 'px');
            $element.css('height', height + 'px');
          } else {
            $element.css('position', 'absolute');
            $element.css('top', '0');
            $element.css('left', '0');
          }
        }

        $scope.$on('$routeChangeStart', function() {
          win.unbind('scroll', affixElement);
        });
        win.bind('scroll', affixElement);
      }
    };
  }

})();
