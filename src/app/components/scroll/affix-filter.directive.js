(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerFilter', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope, $) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var topOffset = 0;
        applier();

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
          console.log(top, topOffset)
          var fixed = false;

          function removeFix() {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('right', '');
            $element.css('width', '');
            $element.css('height', '');
            if ($attrs.hideThis) {
              $element.css('display', 'none');
            }
          }

          function affixElement() {
            if (!fixed && $window.pageYOffset > topOffset) {
              $element.css('position', 'fixed');
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
