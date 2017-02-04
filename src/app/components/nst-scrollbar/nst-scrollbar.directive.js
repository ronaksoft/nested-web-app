(function() {
  'use strict';
  var app = angular.module('ronak.nested.web.components.scroll');
  var defaultSettings = {
    wheelSpeed : 1,
    minScrollbarLength : 16,
    suppressScrollX : false,
    suppressScrollY : false,
    scrollXMarginOffset : 0,
    scrollYMarginOffset : 0,
    scrollAnimate : true,
    scrollSpeed : "slow"
  };

  app.value('nstScrollbarSettings', defaultSettings);
  app.directive('nstScrollbar', nstScrollbar);

  function nstScrollbar($window, nstScrollbarSettings) {
    return {
      restrict : 'A',
      scope : {
        onReachTop : '=',
        onReachRight : '=',
        onReachBottom : '=',
        onReachLeft : '=',
        onHorizontalMove : '=',
        onVerticalMove : '=',
        goUpward : '=',
        goDownward : '=',
        wheelSpeed : '@',
        minScrollbarLength : '@',
        suppressScrollX : '@',
        suppressScrollY : '@',
        scrollXMarginOffset : '@',
        scrollYMarginOffset : '@',
        scrollAnimate : '@',
        scrollSpeed : '@'
      },
      link: link
    };

    function targetIsElement(event, element) {
      return event.target.id === element.id;
    }

    function checkBooleanValue(attr) {
      return attr && attr === 'true';
    }

    function readNumberValue(attr) {
      return !_.isUndefined(attr) ? _.toNumber(attr) : undefined;
    }

    function link($scope, $element, $attrs) {

      var customSettings = {
        wheelSpeed : readNumberValue($attrs.wheelSpeed),
        minScrollbarLength : readNumberValue($attrs.minScrollbarLength),
        suppressScrollX : checkBooleanValue($attrs.suppressScrollX),
        suppressScrollY : checkBooleanValue($attrs.suppressScrollY),
        scrollXMarginOffset : readNumberValue($attrs.scrollXMarginOffset),
        scrollYMarginOffset : readNumberValue($attrs.scrollYMarginOffset),
        scrollAnimate : checkBooleanValue($attrs.scrollAnimate),
        scrollSpeed : $attrs.scrollSpeed === 'slow' || $attrs.scrollSpeed === 'fast' ? $attrs.scrollSpeed : readNumberValue($attrs.scrollSpeed)
      };

      var settings = _.defaults(customSettings, nstScrollbarSettings);

      var container = $element[0];
      var jContainer = $(container);

      // NOTE: perfect-scrollbar does not work without relative position
      if (container) {
        $element.css('position', 'relative');
        Ps.initialize(container, {
          wheelSpeed : settings.wheelSpeed,
          minScrollbarLength : settings.minScrollbarLength,
          suppressScrollX : settings.suppressScrollX,
          suppressScrollY : settings.suppressScrollY,
          scrollXMarginOffset : settings.scrollXMarginOffset,
          scrollYMarginOffset : settings.scrollYMarginOffset,
          useBothWheelAxes: true,
        });
      }

      // Register Events
      if (_.isFunction($scope.onReachBottom)) {
        $window.addEventListener('ps-y-reach-end', function (event) {
          if (targetIsElement(event, container)){
            $scope.onReachBottom(event);
          }
        });
      }

      if (_.isFunction($scope.onReachTop)) {
        $window.addEventListener('ps-y-reach-start', function (event) {
          if (targetIsElement(event, container)){
            $scope.onReachTop(event);
          }
        });
      }

      if (_.isFunction($scope.onReachLeft)) {
        $window.addEventListener('ps-x-reach-start', function (event) {
          if (targetIsElement(event, container)){
            $scope.onReachLeft(event);
          }
        });
      }

      if (_.isFunction($scope.onReachRight)) {
        $window.addEventListener('ps-x-reach-end', function (event) {
          if (targetIsElement(event, container)){
            $scope.onReachRight(event);
          }
        });
      }

      if (_.isFunction($scope.onHorizontalMove)) {
        $window.addEventListener('ps-scroll-x', function (event) {
          if (targetIsElement(event, container)){
            $scope.onHorizontalMove(event);
          }
        });
      }

      if (_.isFunction($scope.onVerticalMove)) {
        $window.addEventListener('ps-scroll-y', function (event) {
          if (targetIsElement(event, container)){
            $scope.onVerticalMove(event);
          }
        });
      }

      $scope.$watch('goUpward', function (newValue, oldValue) {
        if (newValue) {
          if (settings.scrollAnimate) {
            Ps.update(container);
            $(container).animate({
              scrollTop : 0
            }, settings.scrollSpeed, 'linear', function () {
              Ps.update(container);
              $scope.goUpward = false;
            });
          } else {
            Ps.update(container);
            jContainer.scrollTop(0);
            Ps.update(container);
            $scope.goUpward = false;
          }
        }
      });

      $scope.$watch('goDownward', function (newValue, oldValue) {
        if (newValue) {
          if (settings.scrollAnimate) {
            Ps.update(container);
            $(container).animate({
              scrollTop : jContainer.prop('scrollHeight')
            }, settings.scrollSpeed, 'linear', function () {
              Ps.update(container);
              $scope.goDownward = false;
            });
          } else {
            Ps.update(container);
            jContainer.scrollTop(jContainer.prop('scrollHeight'));
            Ps.update(container);
            $scope.goDownward = false;
          }

        }
      });

      $scope.$on('$destroy', function () {
        Ps.destroy(container);
      });

    }
  }

})();
