(function () {

  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userChips', userChips);


  function userChips($templateCache, $compile, $document, datesCalculator, ngJalaaliFDP, moment, NstSvcI18n) {

    return {
      restrict: 'A',
      scope: {
        user: '@',
        onClear: '='
      },
      link: function (scope, element, attrs) {
        
        var template = angular.element($templateCache.get('user-chips.html'));

        init();
        /**
         * Init the directive
         * @return {}
         */
        function init() {

          element.wrap('<div class="user-chips-wrapper"></div>');

          $compile(template)(scope);
          element.after(template);
        }

      }
    };
  }

})();
