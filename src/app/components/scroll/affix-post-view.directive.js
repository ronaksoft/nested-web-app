(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerPostView', onScroll);

  /** @ngInject */
  function onScroll($window, $timeout, $) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);
        var topOffset = 0;
        var container = $attrs.container ? $($attrs.container)[0] : win;
        var rightAuto = $attrs.rtlRightAuto || false;
        var key = $attrs.key || '';

        var applierDeb = _.debounce(applier, 512);
        applierDeb();

        if ($attrs.observe) {
          var onwatchChanged = $scope.$watch(function () {
            return $scope.$parent.$parent.$parent.$parent.affixObserver;
          }, function (v) {
            return $timeout(function () {
              applierDeb();
            }, 420);
          });
        }

        function resizeF() {
          applierDeb();
        }

        win.on("resize", resizeF);
        

        function applier() {
          if (window.affixerListenersPostView && window.affixerListenersPostView[key]) {
            container.removeEventListener("scroll", affixerListenersPostView[key]);
            delete affixerListenersPostView[key];
          }

          if ($attrs.affixerPostView === 'false' || $attrs.affixerPostView === false) return;
          removeFix();
          var top = $element[0].offsetTop + $element.parent()[0].offsetTop + 80 || 0;
          topOffset = top - parseInt($attrs.top);
          var offLeft = $element.offset().left || 0;

          var height = $element.outerHeight();
          var width = $element.outerWidth();
          var dontSetWidth = $attrs.dontSetWidth || false;

          var actualWidth = Math.min(width, win.outerWidth());

          var fixed = false;

          if ($attrs.fixedTop) {
            top = parseInt($attrs.top);
          }

          function removeFix() {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('right', '');
            $element.css('width', '');
            $element.css('height', '');
            $element.css('transform', '');
          }


          function affixElement() {
            // console.log(topOffset);
            if (!fixed && container.scrollTop > topOffset) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) + 'px');
              $element.css('left', offLeft + 'px');
              if (rightAuto) $element.css('right', 'auto');
              if (!dontSetWidth) $element.css('width', actualWidth + 'px');
              $element.css('height', height + 'px');
              $element.css('transform', 'none');
              fixed = true;
            } else if (fixed && container.scrollTop < topOffset) {
              removeFix();
              fixed = false;
            }
          }

          container.addEventListener("scroll", affixElement);

          if (!window.affixerListenersPostView) {
            window.affixerListenersPostView = {};
          }
          window.affixerListenersPostView[key] = affixElement;

          $scope.$on('$destroy', function () {
            container.removeEventListener('scroll', affixElement, $element);
            if(onwatchChanged){onwatchChanged();}
          })
        }
      }
    };
  }

})();
