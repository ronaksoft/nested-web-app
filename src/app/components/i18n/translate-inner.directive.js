/**
 * @file src/app/components/i18n/translate-inner.directive.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Translates and replaces an element inner text
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .directive('translateInner', ['NstSvcTranslation', '$', function (NstSvcTranslation, $) {
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
