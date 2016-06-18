(function() {
  'use strict';

  angular
    .module('nested')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider, toastrConfig, ipnConfig, markedProvider, CacheFactoryProvider) {

    angular.extend(CacheFactoryProvider.defaults, { maxAge: 15 * 60 * 1000});

    // Enable log
    $logProvider.debugEnabled(true);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // International Phone Directive
    ipnConfig.defaultCountry = 'ir';
    ipnConfig.preferredCountries = ['ir', 'pl'];

    // Markdown Configs
    markedProvider.setOptions({
      sanitize: true
    });
    markedProvider.setRenderer({
      heading: function (text, level) {
        return '<strong>' + text + '</strong>';
      }
    });

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;
  }

})();
