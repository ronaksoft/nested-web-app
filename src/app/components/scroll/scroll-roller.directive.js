(function() {
  'use strict';
  var app = angular.module('ronak.nested.web.components.scroll');
  app.directive('scrollRoller', scrollRoller);

  function scrollRoller($timeout) {
    var defaultSettings = {
      animated : true,
      speed : 1000,
      animation : 'swing'
    };

    return {
      restrict : 'A',
      scope : {
        rollUpward : '=',
        rollDownward : '=',
      },
      link: link
    };

    function checkBooleanValue(attr) {
      return attr && attr === 'true';
    }

    function readNumberValue(attr) {
      return !_.isUndefined(attr) ? _.toNumber(attr) : undefined;
    }

    function link($scope, $element, $attrs) {
      var customSettings = {
        animated : checkBooleanValue($attrs.animated),
        speed : readNumberValue($attrs.speed),
        animation : $attrs.animation
      };

      var settings = _.defaults(customSettings, defaultSettings);

      var container = $($attrs.container || 'html, body');
    
      $scope.$watch('rollUpward', function (newValue, oldValue) {
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

      $scope.$watch('rollDownward', function (newValue, oldValue) {
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

    }
  }

})();
