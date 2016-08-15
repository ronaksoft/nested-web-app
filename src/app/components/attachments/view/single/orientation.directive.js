(function() {
  'use strict';

  angular
    .module('nested')
    .directive('orientation', OrientationInherit);

  function OrientationInherit($timeout) {
    return {
      restrict: 'A',
      scope: {
        orientation: '@'
      },
      replace: true,
      link: function (scope ,element) {
        element.removeAttr("style");
        update(scope,element);
        scope.$watch('orientation', function () {
          $timeout(function () {
            update(scope,element);
          });
        });
      },
      template: '<img />'
    };

    function update(scope,element) {
      var ori = scope.orientation;
      var eleH = element[0].parentElement.scrollHeight;
      var eleW = element[0].parentElement.scrollWidth;
      console.log(element[0].parentElement.scrollHeight,element[0].scrollWidth,ori);
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
            'width': element[0].parentElement.scrollHeight,
            'height': element[0].parentElement.scrollWidth
          });
          break;
        case '6':
          element.css({
            'transform': 'rotate(90deg)',
            'width': element[0].parentElement.scrollHeight,
            'height': element[0].parentElement.scrollWidth
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
            'width': element[0].parentElement.scrollHeight,
            'height': element[0].parentElement.scrollWidth
          });
          break;
        case '8':
          element.css({
            'transform': 'rotate(-90deg)',
            'width': element[0].parentElement.scrollHeight,
            'height': element[0].parentElement.scrollWidth
          });
          break;
        default:
          scope.tplUrl = 'app/components/attachments/view/single/partials/default.html';
      }
    }
  }
})();
