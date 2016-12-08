(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translateAttrs', ['NstSvcTranslation', function (NstSvcTranslation) {
      return {
        restrict: 'A',
        compile : function (element, attrs) {
          var markedAttributes = _.split(attrs.translateAttrs, ",");
          _.forEach(markedAttributes, function (attribute) {
            var name = _.camelCase(_.trimStart(attribute, ["data"]));
            element.attr(attribute, NstSvcTranslation.get(attrs[name]));
          });
        }
      };
    }]);
})();
