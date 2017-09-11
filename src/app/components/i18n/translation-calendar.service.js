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
    .service('NstSvcCalendarTranslation', NstSvcCalendarTranslation);

  /** @ngInject */
  function NstSvcCalendarTranslation(NstSvcI18n) {
    function Translation() {
      this.currentCalendar = NstSvcI18n.selectedCalendar;
    }
    var formatMap = [];

    formatMap['jalali'] = {
      "HH:mm": "HH:mm",
      "[Yesterday] HH:mm": (NstSvcI18n.selectedLocale === 'en-US'? '[Yesterday] HH:mm': '[دیروز] HH:mm'),
      "MMM DD": "jD jMMMM",
      "DD[/]MM[/]YYYY": "jYYYY[/]jMM[/]jDD",
      "YYYY-MM-DD": "jYYYY-jMM-jDD",
      "dddd, MMMM DD YYYY, HH:mm": "HH:mm dddd، jD jMMMM jYYYY"
    };

    formatMap['gregorian'] = {
    };

    Translation.prototype.constructor = Translation;

    Translation.prototype.get = function (text) {
      var value = formatMap[this.currentCalendar][text];
      if (!value) {
        return text;
      }

      return value;
    };

    return new Translation();
  }
})();
