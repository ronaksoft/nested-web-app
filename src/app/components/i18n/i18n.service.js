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
  function NstSvcI18n(_, NstSvcI18nStorage, moment, $location, $rootScope, NstSvcKeyFactory, NST_KEY, toastr, $window, $q, NST_CONFIG, NstHttp) {
    function I18n() {
      var that = this;
      that.locales = {};
      that.calendars = {};

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

      var localLocale = NstSvcI18nStorage.get('locale');

      var ajax = new NstHttp('',
        {
          cmd: 'system/get_string_constants',
          data: {}
        });

      ajax.post().then(function (data) {
        if (data && data.data) {
          NstSvcI18nStorage.set('locale', languages[data.data.system_lang]);
          var companyDetails = {
            name: data.data.company_name,
            desc: data.data.company_desc,
            logo: data.data.company_logo
          };
          localStorage.setItem('ronak.nested.company.constants', JSON.stringify(companyDetails));
          if (!localLocale && languages[data.data.system_lang] !== languages[NST_CONFIG.DEFAULT_LOCALE]) {
            window.location.reload();
          }
          $rootScope.$broadcast('company-constants-loaded');
        }
      });


      var defaultLocale = "en-US";
      var defaultCalendar = "gregorian";
      var routedLocale = languages[findLanguage("lang")];
      var routedCalendar = calendars[findLanguage("lang")];
      if (routedLocale) {
        NstSvcI18nStorage.set('locale', routedLocale);
      }
      this.selectedCalendar = localStorage.getItem('ronak.nested.web.calendar') || routedCalendar || defaultCalendar;
      this.selectedLocale = NstSvcI18nStorage.get('locale') || routedLocale || defaultLocale;
      initCalandLocale();
      // this.checkSettings().then(function (v) {
      //   console.log('checkSettings 18n', v)
      //   if (v) {
      //     // $window.location.reload();
      //   }
      // })

      function initCalandLocale() {
        if (that.selectedCalendar === "jalali") {
          moment.loadPersian();
        }

        if (that.selectedLocale === 'fa-IR') {
          if (that.selectedCalendar === 'jalali') {
            moment.locale('fa', {months: 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_')});
          }
        } else {
          moment.locale('en-US');
        }
      }

    }

    /**
     * Adds a new locale to the list
     *
     * @param {any} key
     * @param {any} dictionary
     */
    I18n.prototype.checkSettings = function () {
      var deferred = $q.defer();
      var that = this;
      NstSvcKeyFactory.get(NST_KEY.GENERAL_SETTING_I18N).then(function (val) {
        if (!val || val.length == 0) {
          deferred.reject();
          return;
        }
        var settings = JSON.parse(val);
        var reloadFlag = false;
        if (settings && settings.locale.length > 0) {
          if (that.selectedLocale !== settings.locale) {
            that.setLocale(settings.locale);
            reloadFlag = true;
          }
        }
        if (settings && settings.calendar.length > 0) {
          if (that.selectedCalendar !== settings.calendar) {
            that.setCalendar(settings.calendar);
            reloadFlag = true;
          }
        }
        deferred.resolve(reloadFlag)
      }).catch(deferred.reject);

      return deferred.promise;
    };

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
      NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_I18N, JSON.stringify({
        locale: key,
        calendar: this.selectedCalendar
      }));
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
     * Switches to the given calendar and configures moment package
     *
     * @param {any} name
     */
    I18n.prototype.setCalendar = function (name) {
      NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_I18N, JSON.stringify({
        locale: this.selectedLocale,
        calendar: name
      }));
      localStorage.setItem('ronak.nested.web.calendar', name);
      this.selectedCalendar = name;
      moment.locale((name === 'jalali' ? 'fa' : 'en-US'));
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
