(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerPostView', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,$timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {

        var win = angular.element($window);
        var topOffset = 0;
        var afterContent = 0;
        var applierTrigger = false;
        var container = $attrs.container ? $($attrs.container) : win;
        var containerLeft = $('body').offset().left || 0;
        var rightAuto = $attrs.rtlRightAuto || false;

        var isRTL = $rootScope._direction;

        var i = 0;
        var defTop = $element.offset().top;

        applier();
        if( $attrs.observe ) {
          $scope.$watch(function(){
            return $scope.$parent.$parent.$parent.affixObserver;
          },function(){
            return $timeout(function(){applier()},500);
          });
        }


        win.on("resize", function () {
          applier();
        });

        function applier() {
          if ($attrs.affixerPostView === 'false' || $attrs.affixerPostView === false) return;
          removeFix();
          var top = $element[0].offsetTop + $element.parent()[0].offsetTop + 58 || 0;

          topOffset = top - parseInt($attrs.top);
          var offLeft = $element.offset().left || 0;

          // if($attrs.parentMode) offLeft = $element.parent().offset().left;

          var height = $element.outerHeight();
          var width = $element.outerWidth();
          var dontSetWidth = $attrs.dontSetWidth || false;

          var actualWidth = Math.min(width, win.outerWidth());

          var fixed = false;

          if (!!$attrs.parent && $($attrs.parent).offset() ) {
            containerLeft = $($attrs.parent)[0].offsetLeft;
          }

          
          if (!!$attrs.afterContent ) {
            afterContent = $attrs.afterContent;
          }

          if (!!$attrs.fixedTop ) {
            top = parseInt($attrs.top);
          }
          if (!!$attrs.clearRight ) {
            var clearRight = true;
          }

          // affixElement();
          

            // if (isChrome || isFirefox) {
            //   offLeft = parseInt($(container).offset().left) + parseInt(afterContent) - parseInt($('.sidebar').offset().left);
            // }else if (!(isChrome || isFirefox )){
            //   offLeft = parseInt($(container).offset().left) + parseInt(afterContent);
            // }
          
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
            if (!!$attrs.firstImp ) {
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


          container.bind('scroll', affixElement);
          firstFixes();

        }

      }
    };
  }

})();
