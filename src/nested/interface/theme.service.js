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
    .service('NstViewService', NstViewService);

  function NstViewService(_, NstSvcViewStorage, moment, $location, $rootScope, NstSvcKeyFactory, NST_KEY, toastr, $window, $q, NST_CONFIG, NstHttp) {
    function I18n() {
      var that = this;

      this.selectedTheme = NstSvcViewStorage.get('nightMode') || false;


    }

    I18n.prototype.getTheme = function () {
      var deferred = $q.defer();
      NstSvcKeyFactory.get(NST_KEY.WEBAPP_SETTING_THEME_NIGHT_MODE).then(deferred.resolve).catch(deferred.reject);
      return deferred.promise;
    };

    I18n.prototype.setTheme = function (val) {
      var deferred = $q.defer();
      NstSvcViewStorage.set('nightMode', val);
      NstSvcKeyFactory.set(NST_KEY.WEBAPP_SETTING_THEME_NIGHT_MODE, '' + val).then(deferred.resolve);
      return deferred.promise;
    };

    I18n.prototype.applyTheme = function () {
      this.getTheme().then(function (theme) {
        if (theme.length > 0 && theme == "true") {
          $('html').attr('theme', 'dark');
        } else {
          $('html').attr('theme', 'normal');
        }
      })
    };

    return new I18n();

  }
})();
