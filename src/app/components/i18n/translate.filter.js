/**
 * @file src/app/components/i18n/translate.filter.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description This filter returns the translated value of the given text
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function (){
    angular
      .module('ronak.nested.web.components.i18n')
      .filter('translate', ['NstSvcTranslation' , function (NstSvcTranslation) {
        var translator = function (text) {
          return NstSvcTranslation.get(text);
        };

        return translator;
      }]);
})();
