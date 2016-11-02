(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translate', ['NstSvcTranslation', function (NstSvcTranslation) {
      return {
        restrict: 'AE',
        // scope: true,
        link: function (scope, element, attrs) {
          console.log('haha');
          var text = element[0].innerText;
          element[0].innerText = NstSvcTranslation.get(text);
        }
      };
    }]);
})();
