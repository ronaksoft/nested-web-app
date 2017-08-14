(function() {
  'use strict';
  var app = angular.module('ronak.nested.web.components.scroll');
  app.directive('scrollRoller', scrollRoller);

  function scrollRoller(_) {
    var defaultSettings = {
      animated : true,
      speed : 1000,
      animation : 'swing'
    };

    return {
      restrict : 'EA',
      scope : {
        rollUpward : '=',
        rollDownward : '='
      },
      link: link
    };

    function checkBooleanValue(attr) {
      return attr && attr === 'true';
    }

    function readNumberValue(attr) {
      return !_.isUndefined(attr) ? _.toNumber(attr) : undefined;
    }

    function link($scope, $attrs) {
      var customSettings = {
        animated : checkBooleanValue($attrs.animated),
        speed : readNumberValue($attrs.speed),
        animation : $attrs.animation
      };

      var settings = _.defaults(customSettings, defaultSettings);

      var container = $($attrs.container || 'html, body');

      var rollUpwardCleaner = $scope.$watch('rollUpward', function (newValue) {
        if (newValue) {
          if (settings.animated) {
            container.animate({
              scrollTop : 0
            }, settings.speed, settings.animate, function () {
              $scope.rollUpward = false;
            });
          } else {
            container.scrollTop(0);
          }
        }
      });

      var rollDownwardCleaner = $scope.$watch('rollDownward', function (newValue) {
        if (newValue) {
          var height = container.prop('scrollHeight');
          if (settings.animated) {
            container.animate({
              scrollTop : height
            }, settings.speed, settings.animate, function () {
              $scope.rollDownward = false;
            });
          } else {
            container.scrollTop(height);
          }

        }
      });

      $scope.$on('$destroy', function () {
        rollDownwardCleaner();
        rollUpwardCleaner();
      });
    }
  }

})();
