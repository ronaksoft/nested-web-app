(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $uibModal, $timeout, $interval, $state,
                    ngProgressFactory,
                    NST_CONFIG, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_LOCALE_EN_US, NST_LOCALE_FA_IR,
                    NstSvcAuth, NstSvcI18n) {
    window.nestedLogs = [];
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {

    }

    $rootScope.progress = {
      bar: ngProgressFactory.createInstance(),
      fn: {
        start: function () {
          $rootScope.progress.bar.start();
        },
        complete: function () {
          $rootScope.progress.bar.complete();
        },
        stop: function () {
          $rootScope.progress.bar.stop();
        },
        reset: function () {
          $rootScope.progress.bar.reset();
        }
      }
    };

    $rootScope.progress.bar.setHeight('5px');
    // $rootScope.progress.bar.setColor('#14D766');

    $rootScope.modals = {};

    //Config Tiny-MCE base url
    if (NST_CONFIG.TINY_MCE_ASSETS_PATH) {
      tinyMCE.baseURL = NST_CONFIG.TINY_MCE_ASSETS_PATH;
    }

    // $.get('/assets/locales/en-US.json', function (data) {
    //   setTimeout(function () {
    //     NstSvcI18n.addLocale("en-US", data);
    //   }, 3000);
    // });

    NstSvcI18n.addLocale("en-US", NST_LOCALE_EN_US);
    NstSvcI18n.addLocale("fa-IR", NST_LOCALE_FA_IR);

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (!$rootScope.stateHistory) {
        $rootScope.stateHistory = [];
      }

      $rootScope.stateHistory.push({
        state: toState,
        params: toParams
      });

    });

  }
})();
