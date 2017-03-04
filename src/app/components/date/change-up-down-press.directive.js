(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .directive('changeUpDownPress', changeUpDownPress);

  function changeUpDownPress() {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function(e) {
          if (_.includes([38, 40], e.keyCode)) {
            e.preventDefault();
            scope.$apply(function() {
              if (e.keyCode === 38) {
                scope.ngModel++;
              } else if (e.keyCode === 40) {
                scope.ngModel--;
              }
            });
          }
        });
      }
    };

  }
})();
