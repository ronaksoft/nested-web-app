(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixPost', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,deviceDetector,$timeout,NstSvcTranslation) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);
        var isMobile = deviceDetector.isMobile() || deviceDetector.isTablet();
        var isRTL = $rootScope._direction == 'rtl';
        var MobTopOff = isMobile ? 56 : 0;
        win.bind('scroll', affixElement);

        //TODO handle win resize event
        function affixElement() {

          if ($window.pageYOffset + MobTopOff > $element.parent().offset().top && $window.pageYOffset < $element.parent().children().first().height() + $element.parent().offset().top - 50) {
            $element.css('position', 'fixed');
            $element.css('top', 24 + MobTopOff + 'px');
            if (!isRTL) $element.css('left', $element.parent().offset().left + 'px');
            if (isRTL && !isMobile) $element.css('right', $element.parent().offset().left - 20 + 'px');
            if (isRTL && isMobile) $element.css('right', $element.parent().offset().left + 'px');
          } else {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('right', '');
          }

        }

      }
    };
  }

})();
