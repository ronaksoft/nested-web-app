(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerFilter', onScroll);

  /** @ngInject */
  function onScroll($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var topOffset = 0;

        $timeout(function () {
          topOffset = (($attrs.fixedNavbar ? 48 : $element.offset().top) || 0) - parseInt($attrs.top);
          $rootScope.affixBlocks.push({
            el: $element,
            topOffset: topOffset,
            fixed: false,
            hideThis: $attrs.hideThis == 'true'
          })
        }, 128);

      }
    };
  }

})();
