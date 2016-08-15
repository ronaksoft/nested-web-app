(function() {
  'use strict';

  angular
    .module('nested')
    .directive('orientation', OrientationInheritance);

  function OrientationInheritance($timeout) {
    return {
      restrict: 'A',
      scope: {
        orientation: '@'
      },
      link: function (scope ,element) {
        scope.$watch('orientation', function () {
          if (scope.orientation > 0){
            $timeout(function () {
              update(scope,element);
            });
          }
        });
      }
    };

    function update(scope,element) {
      element.removeAttr("style");
      let ori = scope.orientation;
      let eleH = element[0].parentElement.scrollHeight;
      let eleW = element[0].parentElement.scrollWidth;
      switch (ori){
        case '1':
          // No action needed
          break;
        case '2':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'width': eleH,
            'height': eleW
          });
          break;
        case '3':
          element.css({
            'transform': 'rotate(180deg)'
          });
          break;
        case '4':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(180deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH"
          });
          break;
        case '5':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'width': eleH,
            'height': eleW
          });
          break;
        case '6':
          element.css({
            'transform': 'rotate(90deg)',
            'width': eleH,
            'height': eleW
          });
          break;
        case '7':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(-90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'width': eleH,
            'height': eleW
          });
          break;
        case '8':
          element.css({
            'transform': 'rotate(-90deg)',
            'width': eleH,
            'height': eleW
          });
          break;
        default:
          element.css({});
      }
    }
  }
})();
