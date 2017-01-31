(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixPost', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,$timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);

        win.bind('scroll', affixElement);

        //TODO handle win resize event
        function affixElement() {

          if ($window.pageYOffset > $element.parent().offset().top && $window.pageYOffset < $element.parent().children().first().height() + $element.parent().offset().top - 50) {
            $element.css('position', 'fixed');
            $element.css('top', 24 + 'px');
            $element.css('left', $element.parent().offset().left + 'px');
          } else {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
          }

        }

      }
    };
  }

})();
