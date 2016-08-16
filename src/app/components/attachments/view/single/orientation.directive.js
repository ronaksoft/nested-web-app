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
      $timeout(function () {
        console.log(element[0].parentElement.scrollHeight,element[0].parentElement.scrollWidth);
      },100);
      var ori = scope.orientation;
      var eleH = element[0].parentElement.scrollHeight;
      var eleW = element[0].parentElement.scrollWidth;
      switch (ori){
        case '1':
          element.animate({
            'opacity': 1
          }, 'slow');
          break;
        case '2':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH"
          }).animate({
            'opacity': 1
          }, 'slow');
          break;
        case '3':
          element.css({
            'transform': 'rotate(180deg)'
          }).animate({
            'opacity': 1
          }, 'slow');
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
          element.animate({
            'opacity': 1
          }, 'slow');
          break;
        case '5':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH"
          });
          $timeout(function () {
            element.animate({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
              'opacity': 1
          }, 'slow');
          },100);
          break;
        case '6':
          element.css({
            'transform': 'rotate(90deg)'
          });
          $timeout(function () {
            element.animate({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
              'opacity': 1
            }, 'slow');
          },100);
          break;
        case '7':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(-90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH"
          });
          $timeout(function () {
            element.animate({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
              'opacity': 1
            }, 'slow');
          },100);
          break;
        case '8':
          element.css({
            'transform': 'rotate(-90deg)'
          });
          $timeout(function () {
            element.animate({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
              'opacity': 1
            }, 'slow');
          },100);
          break;
        default:
          element.css({});
      }
    }
  }
})();
