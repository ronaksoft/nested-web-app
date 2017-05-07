(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcI18n', NstSvcI18n);

  /** @ngInject */
  function NstSvcI18n(_, NstSvcI18nStorage, moment, $location) {
    function I18n() {
      this.locales = {};

      var languages = {
        "fa": "fa-IR",
        "fa-IR": "fa-IR",
        "persian": "fa-IR",
        "en": "en-US",
        "english": "en-US",
        "en-US": "en-US"
      };

      var defaultLocale = "en-US";
      var routedLocale = languages[findLanguage("lang")];
      if (routedLocale) {
        NstSvcI18nStorage.set('locale', routedLocale)
      }
      this.selectedLocale = NstSvcI18nStorage.get('locale') || routedLocale || defaultLocale;
      if (this.selectedLocale === "fa-IR") {
        moment.loadPersian();
        moment.locale('fa', {months: 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_')});
      } else {
        moment.locale(this.selectedLocale);
      }
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

    I18n.prototype.setLocale = function (key) {
      var name = key || this.selectedLocale;
      if (_.has(this.locales, name)) {
        this.selectedLocale = name;
        NstSvcI18nStorage.set('locale', name);
        moment.locale(key);
      } else {
        throw Error('Locale "' + name + '" does not exist.');
      }
    };

    I18n.prototype.clearSavedLocale = function () {
      NstSvcI18nStorage.remove('locale');
    }

    function findLanguage(key) {
      var queryParameters = $location.search();

      return queryParameters[key] || "";
    }

    return new I18n();

  }
})();
