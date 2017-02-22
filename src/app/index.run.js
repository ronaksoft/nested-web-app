(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $uibModal, $timeout, $interval, $state,
                    NST_CONFIG, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_LOCALE_EN_US, NST_LOCALE_FA_IR,
                    NstSvcAuth, NstSvcI18n) {
    window.nestedLogs = [];
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {

    }

    $rootScope.modals = {};

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
