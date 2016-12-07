(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcTranslation', NstSvcTranslation);

  /** @ngInject */
  function NstSvcTranslation(NstSvcI18n, NstSvcLogger) {
    function Translation() {
      this.currentLocale = null;
    }

    Translation.prototype.get = function (text, locale) {
      if (locale || !this.currentLocale) {
        this.currentLocale = NstSvcI18n.getLocale(locale);
      }
      var value = this.currentLocale[text];
      if (!value) {
        NstSvcLogger.debug("NstSvcTranslation : KEY NOT FOUND : " +  text);

        return text;
      }

      return value;
    };

    return new Translation();
  }
})();
