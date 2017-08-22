(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerPostView', onScroll);

  /** @ngInject */
  function onScroll($window,$timeout, $) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {

        var win = angular.element($window);
        var topOffset = 0;
        var container = $attrs.container ? $($attrs.container) : win;
        var rightAuto = $attrs.rtlRightAuto || false;

        applier();
        if( $attrs.observe ) {
          $scope.$watch(function(){
            return $scope.$parent.$parent.$parent.affixObserver;
          },function(){
            return $timeout(function(){applier()},500);
          });
        }
        function resizeF () {
          applier();
        }

        // win.on("resize", resizeF);

        function applier() {

          if (window.affixerListenersPostView && window.affixerListenersPostView.length > 0) {
            window.affixerListenersPostView.forEach( function(item){
              window.removeEventListener("scroll", item);
            });
          }

          if ($attrs.affixerPostView === 'false' || $attrs.affixerPostView === false) return;
          removeFix();
          var top = $element[0].offsetTop + $element.parent()[0].offsetTop + 58 || 0;

          topOffset = top - parseInt($attrs.top);
          var offLeft = $element.offset().left || 0;

          var height = $element.outerHeight();
          var width = $element.outerWidth();
          var dontSetWidth = $attrs.dontSetWidth || false;

          var actualWidth = Math.min(width, win.outerWidth());

          var fixed = false;

          if ($attrs.fixedTop ) {
            top = parseInt($attrs.top);
          }
          if ($attrs.clearRight ) {
            var clearRight = true;
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
            if (!fixed && container[0].scrollTop > topOffset) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) + 'px');
              $element.css('left', offLeft + 'px');
              if (rightAuto) $element.css('right', 'auto');
              if(!dontSetWidth) $element.css('width', actualWidth + 'px');
              $element.css('height', height + 'px');
              $element.css('transform', 'none');
              fixed = true;
            } else if (fixed && container[0].scrollTop < topOffset ) {
              removeFix();
              fixed = false;
            }
          }

          function firstFixes() {
            if ($attrs.firstImp ) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) - parseInt(topOffset) + 'px');
              $element.css('left', offLeft + 'px');
              $element.css('width', width + 'px');
              $element.css('height', height + 'px');
              if(clearRight) {
                $element.css('right', 'auto');
              }
              return container.unbind('scroll', affixElement);
            }
          }

          window.addEventListener("scroll", affixElement);
          firstFixes();
          
          if ( !window.affixerListenersPostView ) {
            window.affixerListenersPostView = [];
          }
          window.affixerListenersPostView.push(affixElement);

          $scope.$on('$destroy', function () {
            container.unbind('scroll', affixElement);
          })
        }
      }
    };
  }

})();
