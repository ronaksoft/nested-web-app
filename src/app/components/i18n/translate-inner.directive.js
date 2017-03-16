(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translateInner', ['NstSvcTranslation', function (NstSvcTranslation) {
      return {
        restrict: 'A',
        replace : true,
        compile : function (element, attributes) {
          var jelement = $(element);
          var text = jelement[0].innerHTML || jelement[0].innerText;

          var value = NstSvcTranslation.get(text);

          jelement.html(value);
        }
      };
    }]);
})();
