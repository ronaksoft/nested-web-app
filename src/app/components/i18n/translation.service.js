/**
 * @file src/app/components/i18n/translate.filter.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description This services finds the given word or sentence equivalent
 * in the selected locale dictionary and also localizes numbers
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcTranslation', NstSvcTranslation);

  /** @ngInject */
  function NstSvcTranslation(NstSvcI18n, NstSvcLogger) {
    function Translation() {
      this.currentLocale = NstSvcI18n.getLocale();
    }

    Translation.prototype.get = function (text) {
      var value = this.currentLocale[text];
      if (!value) {
        // NstSvcLogger.debug("NstSvcTranslation : KEY NOT FOUND : " +  text);

        return text;
      }

      return value;
    };

    Translation.prototype.localizeNumbers = function (text) {
      var service = this;
      if (!_.isString(text)) {
        return text;
      }

      return text.replace(/\d+/g, function (match) {
        return _.join(_.map(_.toString(match), function (char) {
          return service.get(char) || char;
        }),"");
      });
    };

    return new Translation();
  }
})();
