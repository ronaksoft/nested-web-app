(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $templateCache, iScrollService, $http, deviceDetector, SvcCardCtrlAffix,
    NST_LOCALE_EN_US, NST_LOCALE_FA_IR,
    NstSvcI18n) {
    window.nestedLogs = [];
    // window.onerror = function(messageOrEvent, source, lineno, colno, error) {
    //
    // }

    $rootScope.modals = {};
    if (deviceDetector.os !== 'mac') {
      window.nativeScroll = false;
      iScrollService.toggle(true);
      iScrollService.state.useIScroll = true;
    } else {
      window.nativeScroll = true;
    }

    if (typeof window.svg4everybody === 'function') {
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
      SvcCardCtrlAffix.reset();
      $rootScope.stateHistory.push({
        state: toState,
        params: toParams
      });

    });
    $templateCache.put("directives/toast/toast2.html", "<div class=\"{{toastClass}} {{toastType}}\" ng-click=\"tapToast()\"><div ng-switch on=\"allowHtml\" class=\"_df _fn\"><div ng-switch-default ng-if=\"title\" class=\"{{titleClass}}\" aria-label=\"{{title}}\">{{title}}</div><div ng-switch-default class=\"{{messageClass}}\" aria-label=\"{{message}}\">{{message}}</div><div ng-switch-when=\"true\" ng-if=\"title\" class=\"{{titleClass}}\" ng-bind-html=\"title\"></div><div ng-switch-when=\"true\" class=\"{{messageClass}}\" ng-bind-html=\"message\"></div><div ng-if=\"extraData.undo\" class=\"{{messageClass}} undo-butn\" ng-click=\"extraData.undo()\">Undo</div></div><progress-bar ng-if=\"progressBar\"></progress-bar></div>");

    $http.get('app/components/chips/user-chips.html', {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put("user-chips.html", tplContent);
      });
    $http.get('app/components/chips/place-chips.html', {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put("place-chips.html", tplContent);
      });
    $http.get('app/components/chips/label-chips.html', {
      cache: $templateCache
    })
    .success(function (tplContent) {
      $templateCache.put("label-chips.html", tplContent);
    });
    $http.get('/app/notification/common/picture.html', {
      cache: $templateCache
    })
    .success(function (tplContent) {
      $templateCache.put('/app/notification/common/picture.html', tplContent);
    });
    $http.get('/app/notification/common/name.html', {
      cache: $templateCache
    })
    .success(function (tplContent) {
      $templateCache.put('/app/notification/common/name.html', tplContent);
    });

    var cacheTaskActs = [
      'app/task/common/activity/partials/base.html',
      'app/task/common/activity/partials/status-changed.html',
      'app/task/common/activity/partials/watcher-added.html',
      'app/task/common/activity/partials/watcher-removed.html',
      'app/task/common/activity/partials/attachment-added.html',
      'app/task/common/activity/partials/attachment-removed.html',
      'app/task/common/activity/partials/comment.html',
      'app/task/common/activity/partials/title-changed.html',
      'app/task/common/activity/partials/desc-changed.html',
      'app/task/common/activity/partials/candidate-added.html',
      'app/task/common/activity/partials/candidate-removed.html',
      'app/task/common/activity/partials/todo-added.html',
      'app/task/common/activity/partials/todo-removed.html',
      'app/task/common/activity/partials/todo-changed.html',
      'app/task/common/activity/partials/todo-done.html',
      'app/task/common/activity/partials/todo-undone.html',
      'app/task/common/activity/partials/label-added.html',
      'app/task/common/activity/partials/label-removed.html',
      'app/task/common/activity/partials/due-date-updated.html',
      'app/task/common/activity/partials/due-date-removed.html'
    ]
    cacheTaskActs.forEach(function (tpl) {
      $http.get(tpl, {
        cache: $templateCache
      })
      .success(function (tplContent) {
        $templateCache.put(tpl, tplContent);
      });
    })
  }
})();
