(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerFilter', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope, $timeout, deviceDetector) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var topOffset = 0;
        var isRTL = $rootScope._direction === 'rtl';
        $timeout(function () {
          applier();
        }, 128);

        // win.on("resize", function () {
        //   applier();
        // });

        function applier() {
          removeFix();

          // if (window.affixerListenerFilter && window.affixerListenerFilter.length > 0) {
          //   window.affixerListenerFilter.forEach( function(item){
          //     window.removeEventListener("scroll", item);
          //   });
          // }

          var top = $attrs.fixedNavbar ? 48 : $element.offset().top || 0;

          topOffset = top - parseInt($attrs.top);
          var fixed = false;

          function removeFix() {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('right', '');
            $element.css('width', '');
            $element.css('height', '');
            $element.css('transform', '');
              $element.css('left', '0');
            if ($attrs.hideThis) {
              $element.css('display', 'none');
            }
          }

          function affixElement() {
            if (!fixed && $window.pageYOffset > topOffset) {
              $element.css('position', 'fixed');
              if (isRTL) {
                $element.css('left', '50%');
                $element.css('transform', 'translateX(-50%)');
              } else {
                $element.css('transform', 'translateX(-50%)');
                if ( deviceDetector.browser === 'safari') {
                  $element.css('left', '50%');
                } else {
                  $element.css('left', '50vw');
                }
              }
              $element.css('display', '');
              fixed = true;
            } else if (fixed && $window.pageYOffset < topOffset ) {
              removeFix();
              fixed = false;
            }
          }

          window.addEventListener("scroll", affixElement);

          if ( !window.affixerListenerFilter ) {
            window.affixerListenerFilter = [];
          }
          window.affixerListenerFilter.push(affixElement);

        }

      }
    };
  }

})();
