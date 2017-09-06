(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixer', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,$timeout, $, _) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element(window),
            topOffset = 0,
            afterContent = 0,
            containerLeft = $('body').offset().left || 0,
            isRTL = $rootScope._direction;
            // obj = {},
            // hash = Math.ceil(Math.random() * 2000);

        $rootScope.$on('affixCheck',function(){
          $timeout(function(){applier();},10);
        });

        $timeout(function(){applier();},10);

        function applier() {
          removeFix();

          if (window.affixerListeners && window.affixerListeners.length > 0) {
            window.affixerListeners.scroll.forEach( function(item){
              window.removeEventListener("scroll", item);
            });
            window.affixerListeners.resize.forEach( function(item){
              window.removeEventListener("scroll", item);
            });
          }

          var top = $element.offset().top || 0;

          topOffset = $element.offset().top - parseInt($attrs.top) - 24;

          var offLeft = $element.offset().left || 0;

          var height = $element.outerHeight();
          var width = $element.outerWidth();
          var dontSetWidth = $attrs.dontSetWidth || false;

          var actualWidth = Math.min(width, win.outerWidth());

          var fixed = false;

          if ($attrs.parent && $($attrs.parent).offset()) {
            containerLeft = $($attrs.parent)[0].offsetLeft;
          }


          if ($attrs.afterContent) {
            afterContent = $attrs.afterContent;
          }

          if ($attrs.fixedTop) {
            top = parseInt($attrs.top);
          }
          if ($attrs.clearRight) {
            var clearRight = true;
          }

          //for create a fixed element we need a left parameter so we read it from itself
          function findLeftOffset() {
            if (isRTL == 'rtl') {
              offLeft = parseInt(containerLeft)  +  $($attrs.parent).width()  - parseInt(afterContent) - width;
            } else {
              offLeft = parseInt(containerLeft) + parseInt(afterContent) + 240;
            }

          }
          function removeFix() {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('right', '');
            $element.css('width', '');
            $element.css('height', '');
          }


          function affixElement() {
            if (!fixed && $window.pageYOffset > topOffset) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) + 'px');
              // if (isRTL == 'ltr')$element.css('left', offLeft + 'px');
              // if (isRTL == 'rtl')$element.css('left', offLeft + 'px');
              if(!dontSetWidth) $element.css('width', actualWidth + 'px');
              // $element.css('height', height + 'px');
              fixed = true;
            } else if (fixed && $window.pageYOffset < topOffset ) {
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
            }
          }

          findLeftOffset();
          affixElement();
          firstFixes();

          var resizeE = _.debounce(applier, 16);

          window.addEventListener("scroll", affixElement);
          window.addEventListener("resize", resizeE);

          if ( !window.affixerListeners ) {
            window.affixerListeners = {
              scroll : [],
              resize : []
            };
          }
          window.affixerListeners.scroll.push(affixElement);
          window.affixerListeners.resize.push(resizeE);


        }

      }
    };
  }

})();
