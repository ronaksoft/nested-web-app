/**
 * @file src/app/components/i18n/localize.filter.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Returns the localized numbers and leaves the other characters untouched
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  angular
    .module('ronak.nested.web.components.i18n')
    .filter('localize', ['NstSvcTranslation', '_', function(NstSvcTranslation, _) {

      var numbers = {
        '1': NstSvcTranslation.get("1"),
        '2': NstSvcTranslation.get("2"),
        '3': NstSvcTranslation.get("3"),
        '4': NstSvcTranslation.get("4"),
        '5': NstSvcTranslation.get("5"),
        '6': NstSvcTranslation.get("6"),
        '7': NstSvcTranslation.get("7"),
        '8': NstSvcTranslation.get("8"),
        '9': NstSvcTranslation.get("9"),
        '0': NstSvcTranslation.get("0")
      };

      var localizer = function(text) {
        return _.join(_.map(_.toString(text), function (char) {
          return numbers[char] || char;
        }),"");
      };

      return localizer;
    }]);
})();
