/**
 * @file src/app/components/i18n/translate.directive.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Translates and replaces the element with the translated text wrapped in a span
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translate', ['NstSvcTranslation', function (NstSvcTranslation, $) {
      return {
        restrict: 'E',
        replace : true,
        template : function (element) {

          var jelement = $(element)[0];
          var text = jelement.innerHTML || jelement.innerText;

          var value = NstSvcTranslation.get(text);
          return "<span>" + value + "</span>";
        }
      };
    }]);
})();
