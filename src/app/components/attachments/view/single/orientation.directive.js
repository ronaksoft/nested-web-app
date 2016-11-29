(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.image')
    .directive('orientation', OrientationInheritance);

  function OrientationInheritance($timeout) {
    return {
      restrict: 'A',
      scope: {
        orientation: '@',
        source : "@",
        attachment : "="
      },
      link: function (scope ,element) {
        scope.$watch('source', function (newValue, oldValue) {
          if (newValue) {
            var jelement = $(element);
            jelement.load(function () {
              EXIF.getData(jelement[0], function() {
                console.log(EXIF.pretty(this));
                // console.log(this);
                // if (this.exifdata || this.iptcdata) {
                //   scope.attachment.meta.exif = this.exifdata || {};
                //   scope.attachment.meta.iptc = this.iptcdata || {};
                // }
                // $timeout(function () {
                //   update(scope,element);
                // });
              });
            });
          }

          // $timeout(function () {
          //   element.animate({
          //     'opacity': 1
          //   }, 700);
          // },11);

        });
      }
    };

    function update(scope,element) {
      element.removeAttr("style");
      var ori = scope.attachment.meta.exif.Orientation;
      var eleH = element[0].parentElement.scrollHeight;
      var eleW = element[0].parentElement.scrollWidth;
      switch (ori){
        case '1':
          element.css({
            'opacity': 0
          });
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '2':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'opacity': 0
          });
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '3':
          element.css({
            'transform': 'rotate(180deg)',
            'opacity': 0
          });
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '4':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(180deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'opacity': 0
          });
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '5':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'opacity': 0
          });
          $timeout(function () {
            element.css({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
            });
          },10);
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '6':
          element.css({
            'transform': 'rotate(90deg)',
            'opacity': 0
          });
          $timeout(function () {
            element.css({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
            });
          },10);
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '7':
          element.css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1) rotate(-90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'opacity': 0
          });
          $timeout(function () {
            element.css({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
            });
          },10);
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        case '8':
          element.css({
            'transform': 'rotate(-90deg)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH",
            'opacity': 0
          });
          $timeout(function () {
            element.css({
              'width': element[0].parentElement.clientHeight,
              'height': element[0].parentElement.clientWidth,
            });
          },10);
          $timeout(function () {
            element.animate({
              'opacity': 1
            }, 700);
          },11);
          break;
        default:
          element.css({});
      }
    }
  }
})();
