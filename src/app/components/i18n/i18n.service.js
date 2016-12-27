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
    }

    I18n.prototype.addLocale = function (key, dictionary) {
      if (!_.has(this.locales, key)) {
        this.locales[key] = dictionary;
      } else {
        _.merge(this.locales[key], dictionary)
      }
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
      var name = key || this.selectedLocale;
      if (_.has(this.locales, name)) {
        this.selectedLocale = name;
        NstSvcI18nStorage.set('locale', name);
      } else {
        throw Error('Locale "' + name + '" does not exist.');
      }
    };

    I18n.prototype.clearSavedLocale = function () {
      NstSvcI18nStorage.remove('locale');
    }

    return new I18n();

  }
})();
