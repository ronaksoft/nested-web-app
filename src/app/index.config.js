(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider,  toastrConfig, localStorageServiceProvider,
                  $animateProvider, $sceDelegateProvider) {


    localStorageServiceProvider
      .setPrefix('ronak.nested.web');

    // Enable log
    $logProvider.debugEnabled(true);

    $sceDelegateProvider.resourceUrlWhitelist([

      // Allow same origin resource loads.
      'self',

      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://xerxes.nested.ronaksoftware.com/download/**',
      'https://xerxes.nested.me/**',

    ]);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 5000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventOpenDuplicates = true;
    toastrConfig.progressBar = true;

    $animateProvider.classNameFilter(/use-ng-animate/);


    //Config ui-select-choices
    // force to open in down
    // uiSelectConfig.dropdownPosition = 'down';
  }
})();
