/**
 * @file src/app/components/i18n/translate-attrs.directive.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Translates and replaces the given attributes value
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translateAttrs', ['NstSvcTranslation', '_', function (NstSvcTranslation, _) {
      return {
        restrict: 'A',
        compile : function (element, attrs) {
          // The marked attributes are specified by user
          var markedAttributes = _.split(attrs.translateAttrs, ",");
          _.forEach(markedAttributes, function (attribute) {
            var name = _.camelCase(_.trimStart(attribute, ["data"]));
            // replaces the attribute value with the translated text
            element.attr(attribute, NstSvcTranslation.get(attrs[name]));
          });
        }
      };
    }]);
})();
