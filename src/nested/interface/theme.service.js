(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstThemeService', NstThemeService);

  function NstThemeService(NstSvcViewStorage, NstSvcKeyFactory, NST_KEY, $q) {
    function themeHandlers() {
    }

    themeHandlers.prototype.getTheme = function () {
      var deferred = $q.defer();
      // NstSvcKeyFactory.get(NST_KEY.WEBAPP_SETTING_THEME_NIGHT_MODE).then(deferred.resolve).catch(deferred.reject);
      deferred.resolve(NstSvcViewStorage.get('nightMode'));
      return deferred.promise;
    };

    themeHandlers.prototype.setTheme = function (val) {
      if (val) {
        val = 'yes';
      } else {
        val = 'no';
      }
      var deferred = $q.defer();
      NstSvcViewStorage.set('nightMode', val);
      deferred.resolve(val);
      // NstSvcKeyFactory.set(NST_KEY.WEBAPP_SETTING_THEME_NIGHT_MODE, '' + val).then(deferred.resolve);
      return deferred.promise;
    };

    themeHandlers.prototype.applyTheme = function () {
      this.getTheme().then(function (theme) {
        if (theme === 'yes') {
          $('html').attr('theme', 'dark');
        } else {
          $('html').attr('theme', 'normal');
        }
      })
    };

    return new themeHandlers();

  }
})();
