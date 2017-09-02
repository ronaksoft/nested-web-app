/**
 * @file src/app/settings/language/select-language.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user selects a language
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-01
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SelectLanguageController', SelectLanguageController);

  /** @ngInject */
  /**
   * Displays the selected (or default) language and allows switching between supported languages
   *
   * @param {any} $scope
   * @param {any} NstSvcI18n
   */
  function SelectLanguageController($scope, NstSvcI18n) {
    var vm = this;
    // selected locale (We use 'locale' instaed of language in code but 'language' is usually used in UI)
    vm.locale = NstSvcI18n.selectedLocale;
    vm.calendar = NstSvcI18n.selectedCalendar;
    vm.changeLocale = changeLocale;
    vm.changeCalendar = changeCalendar;

    /**
     * Selects a locale and emits `show-loading` event to display the loading page.
     * Then reloads the app to make sure everything is being rendered according to the new locale.
     * Because some locales (like fa-IR) are RTL and a reload is required.
     * @param {any} locale
     */
    function changeLocale(locale) {
      $scope.$emit('show-loading', {});
      NstSvcI18n.setLocale(locale);
      window.location.reload(true);
    }

    /**
     * Selects a calender and emits `show-loading` event to display the loading page.
     * Then reloads the app to make sure everything is being rendered according to the new calender.
     * Because some locales (like fa-IR) are RTL and a reload is required.
     * @param {any} locale
     */
    function changeCalendar(calendar) {
      $scope.$emit('show-loading', {});
      NstSvcI18n.setCalendar(calendar);
      window.location.reload(true);
    }

  }
})();
