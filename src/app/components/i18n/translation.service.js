(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcTranslation', NstSvcTranslation);

  /** @ngInject */
  function NstSvcTranslation(NstSvcI18n, NstSvcLogger) {
    function Translation() {
      this.defaultLocale = "en-US";
      this.currentLocale = null;
    }

    Translation.prototype.get = function (text, locale) {
      if (locale || !this.currentLocale) {
        this.currentLocale = NstSvcI18n.getLocale(locale || this.defaultLocale);
        console.log('Translation : currentLocale', this.currentLocale);
      }
      console.log(text);
      return this.currentLocale[text] || text;
    };

    return new Translation();
  }
})();
