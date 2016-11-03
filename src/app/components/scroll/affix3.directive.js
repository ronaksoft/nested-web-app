(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixers', onScroll);

  /** @ngInject */
  function onScroll($window) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $scope.$watch(function () {
          return $('.content').offset().left
        },function (newVal,oldVal) {
          console.log('channng',arguments);
          fixIt()
        });
        function fixIt() {
          var offLeft = ($('.content').offset().left);
          var offTop = ($element.offset().top);
          var width = ($element.width());

          $element.css('position', 'fixed');
          $element.css('top', offTop + 'px');
          $element.css('left', offLeft + 'px');
          $element.css('width', width + 'px');
        }



        $scope.$on('$routeChangeStart', function() {
          $element.css('position', '');
          $element.css('top', '');
          $element.css('left', '');
          $element.css('width', '');
        });
      }
    };
  }

})();
