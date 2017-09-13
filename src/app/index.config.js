(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider,  toastrConfig, localStorageServiceProvider,
                  $animateProvider, $sceDelegateProvider, $compileProvider) {


    localStorageServiceProvider
      .setPrefix('ronak.nested.web');

    window.actionsGC = [];
    window.addEventListener("beforeunload", function (e) {
      window.actionsGC.forEach(function(fun) {
        if (typeof fun === 'function') {
          fun();
        }
      });
      return;
    });
    // Enable log
    $logProvider.debugEnabled(true);

    $sceDelegateProvider.resourceUrlWhitelist([

      // Allow same origin resource loads.
      'self',

      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://xerxes.nested.ronaksoftware.com/download/**',
      'https://xerxes.nested.me/**'

    ]);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 5000;
    toastrConfig.positionClass = 'toast-top-center';
    toastrConfig.preventOpenDuplicates = false;
    toastrConfig.progressBar = true;
    toastrConfig.autoDismiss = false;
    toastrConfig.onHidden = null;
    toastrConfig.onShown = null;
    toastrConfig.onTap = null;
    toastrConfig.progressBar = false;
    toastrConfig.templates = {
      toast: 'app/components/toast/toast.html',
      progressbar: 'directives/progressbar/progressbar.html'
    };
    
    toastrConfig.closeButton = true;

    $animateProvider.classNameFilter(/use-ng-animate/);


    //Config ui-select-choices
    // force to open in down
    // uiSelectConfig.dropdownPosition = 'down';

    // TODO: Disable it in development mode
    $compileProvider.debugInfoEnabled(false);
  }
})();
