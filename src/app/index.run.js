(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $templateCache, iScrollService,
                    NST_LOCALE_EN_US, NST_LOCALE_FA_IR,
                    NstSvcI18n) {
    window.nestedLogs = [];
    // window.onerror = function(messageOrEvent, source, lineno, colno, error) {
    //
    // }

    $rootScope.modals = {};

    iScrollService.toggle(true);
    
    iScrollService.state.useIScroll = true;

    if( typeof window.svg4everybody === 'function') {
      window.svg4everybody({
        polyfill: true // polyfill <use> elements for External Content
      });
    }
    NstSvcI18n.addLocale("en-US", NST_LOCALE_EN_US);
    NstSvcI18n.addLocale("fa-IR", NST_LOCALE_FA_IR);

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      if (!$rootScope.stateHistory) {
        $rootScope.stateHistory = [];
      }

      $rootScope.stateHistory.push({
        state: toState,
        params: toParams
      });

    });
    $templateCache.put("directives/toast/toast2.html","<div class=\"{{toastClass}} {{toastType}}\" ng-click=\"tapToast()\"><div ng-switch on=\"allowHtml\" class=\"_df _fn\"><div ng-switch-default ng-if=\"title\" class=\"{{titleClass}}\" aria-label=\"{{title}}\">{{title}}</div><div ng-switch-default class=\"{{messageClass}}\" aria-label=\"{{message}}\">{{message}}</div><div ng-switch-when=\"true\" ng-if=\"title\" class=\"{{titleClass}}\" ng-bind-html=\"title\"></div><div ng-switch-when=\"true\" class=\"{{messageClass}}\" ng-bind-html=\"message\"></div><div ng-if=\"extraData.undo\" class=\"{{messageClass}} undo-butn\" ng-click=\"extraData.undo()\">Undo</div></div><progress-bar ng-if=\"progressBar\"></progress-bar></div>");
    

  }
})();
