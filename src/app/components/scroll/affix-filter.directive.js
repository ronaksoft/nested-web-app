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
        var win = angular.element($window);
        var topOffset = 0;
        var isRTL = $rootScope._direction;
        applier();

        // win.on("resize", function () {
        //   applier();
        // });

        function applier() {
          removeFix();

          if (window.affixerListenerFilter && window.affixerListenerFilter.length > 0) {
            window.affixerListenerFilter.forEach( function(item){
              window.removeEventListener("scroll", item);
            });
          }

          var top = $element.offset().top || 0;

          topOffset = 104 + 48 - parseInt($attrs.top);

          var fixed = false;
          console.log($element[0].getBoundingClientRect().top, $element.offset().top, parseInt($attrs.top));

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
