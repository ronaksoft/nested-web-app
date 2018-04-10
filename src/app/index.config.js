(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider,  toastrConfig, localStorageServiceProvider, iScrollServiceProvider,
                  $animateProvider, $sceDelegateProvider, $compileProvider) {


    localStorageServiceProvider
      .setPrefix('ronak.nested.web');

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
    toastrConfig.preventOpenDuplicates = true;
    toastrConfig.progressBar = true;
    toastrConfig.autoDismiss = false;
    toastrConfig.onHidden = null;
    toastrConfig.onShown = null;
    toastrConfig.onTap = null;
    toastrConfig.progressBar = false;
    toastrConfig.templates = {
      toast: 'directives/toast/toast2.html',
      progressbar: 'directives/progressbar/progressbar.html'
    };
    
    toastrConfig.closeButton = true;

    iScrollServiceProvider.configureDefaults({
      iScroll: {
        // Passed through to the iScroll library
        momentum: false,
        scrollX: false,
        scrollY: true,
        probeType: 2,
        tap: false,
        click: false,
        preventDefaultException: {
          tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL|A)$/,
          className: /(^|\s)prevent-scroll(\s|$)/
        },
        mouseWheel: true,
        keyBindings: false,
        scrollbars: true,
        fadeScrollbars: true,
        interactiveScrollbars: true,
        resizeScrollbars: true,
        shrinkScrollbars: true,
        deceleration: 0.001,
        disableMouse: true,
        disableTouch: false,
        disablePointer: true
      },
      directive: {
          // Interpreted by the directive
          refreshInterval: 500
      }
    });

    $animateProvider.classNameFilter(/use-ng-animate/);

    // TODO: Disable it in development mode
    $compileProvider.debugInfoEnabled(false);
  }
})();
