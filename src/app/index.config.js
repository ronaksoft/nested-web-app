(function() {
  'use strict';

  angular
    .module('nested')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider, toastrConfig, ipnConfig) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // International Phone Directive
    ipnConfig.defaultCountry = 'ir';
    ipnConfig.preferredCountries = ['ir', 'pl'];

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;
  }

})();
