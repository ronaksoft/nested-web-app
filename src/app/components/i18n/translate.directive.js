(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translate', ['NstSvcTranslation', function (NstSvcTranslation) {
      return {
        restrict: 'E',
        replace : true,
        template : function (element, attrs) {
          var text = element[0].innerText;
          var value = NstSvcTranslation.get(text);
          return "<span>" + value + "</span>";
        }
      };
    }]);
})();
