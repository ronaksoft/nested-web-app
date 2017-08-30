/**
 * @file src/app/components/disabled-for.directive.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Internationalization service that brings fa-IR and en-US locales in nested
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcI18n', NstSvcI18n);

  /** @ngInject */
  /**
   * Nested supports multiple languages utilizing this service
   *
   * @param {any} _
   * @param {any} NstSvcI18nStorage
   * @param {any} moment
   * @param {any} $location
   * @returns
   */
  function NstSvcI18n(_, NstSvcI18nStorage, moment, $location) {
    function I18n() {
      this.locales = {};
      this.calendars = {};

      var languages = {
        "fa": "fa-IR",
        "fa-IR": "fa-IR",
        "persian": "fa-IR",
        "en": "en-US",
        "english": "en-US",
        "en-US": "en-US"
      };

      var calendars = {
        "fa": "jalali",
        "fa-IR": "jalali",
        "persian": "jalali",
        "en": "gregorian",
        "english": "gregorian",
        "en-US": "gregorian"
      };

      var defaultLocale = "en-US";
      var defaultCalendar = "gregorian";
      var routedLocale = languages[findLanguage("lang")];
      var routedCalendar = calendars[findLanguage("lang")];
      if (routedLocale) {
        NstSvcI18nStorage.set('locale', routedLocale)
      }
      this.selectedLocale = NstSvcI18nStorage.get('locale') || routedLocale || defaultLocale;
      this.selectedCalendar = localStorage.getItem('ronak.nested.web.calendar') || routedCalendar || defaultCalendar;
      if (this.selectedCalendar === "jalali") {
        moment.loadPersian();
      }

      if (this.selectedLocale === 'fa-IR') {
        moment.locale('fa', {months: 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_')});
      } else {
        moment.locale('en-US');
      }
    }

    /**
     * Adds a new locale to the list
     *
     * @param {any} key
     * @param {any} dictionary
     */
    I18n.prototype.addLocale = function (key, dictionary) {
      if (!_.has(this.locales, key)) {
        this.locales[key] = dictionary;
      } else {
        _.merge(this.locales[key], dictionary)
      }
    };

    /**
     * Returns the selected locale
     *
     * @param {any} name
     * @returns
     */
    I18n.prototype.getLocale = function (name) {
      var key = name || this.selectedLocale;
      if (_.has(this.locales, key)) {
        return this.locales[key];
      } else {
        throw Error('Locale "' + key + '" does not exist.');
      }

    };

    /**
     * Switches to the given locale and configures moment package
     *
     * @param {any} key
     */
    I18n.prototype.setLocale = function (key) {
      var name = key || this.selectedLocale;
      if (_.has(this.locales, name)) {
        this.selectedLocale = name;
        NstSvcI18nStorage.set('locale', name);
        // moment.locale(key);
      } else {
        throw Error('Locale "' + name + '" does not exist.');
      }
    };

    I18n.prototype.clearSavedLocale = function () {
      NstSvcI18nStorage.remove('locale');
    };

    /**
     * Switches to the given calender and configures moment package
     *
     * @param {any} key
     */
    I18n.prototype.setCalendar = function (name) {
      this.selectedCalendar = name;
      localStorage.setItem('ronak.nested.web.calendar', name);
      moment.locale((name === 'jalali'? 'fa': 'en-US'));
    };

    /**
     * Returns a query parameter value by key
     *
     * @param {any} key
     * @returns
     */
    function findLanguage(key) {
      var queryParameters = $location.search();

      return queryParameters[key] || "";
    }

    return new I18n();

  }
})();
