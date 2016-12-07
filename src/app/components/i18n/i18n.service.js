(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcI18n', NstSvcI18n);

  /** @ngInject */
  function NstSvcI18n(_, NstSvcI18nStorage) {
    function I18n() {
      this.locales = {};

      this.selectedLocale = NstSvcI18nStorage.get('locale') || "en-US";
      console.log('selectedLocale', this.selectedLocale);
    }

    I18n.prototype.addLocale = function (key, dictionary) {
      if (!_.has(this.locales, key)) {
        this.locales[key] = dictionary;
      } else {
        _.merge(this.locales[key], dictionary)
      }
      console.log(this.locales);
    };

    I18n.prototype.getLocale = function (name) {
      var key = name || this.selectedLocale;
      if (_.has(this.locales, key)) {
        return this.locales[key];
      } else {
        throw Error('Locale "' + key + '" does not exist.');
      }

    };

    I18n.prototype.setLocale = function(key) {
      var key = name || this.selectedLocale;
      if (_.has(this.locale, key)) {
        this.selectedLocale = key;
      } else {
        throw Error('Locale "' + key + '" does not exist.');
      }
    };

    return new I18n();
  }
})();
