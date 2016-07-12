(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $interval, $uibModal,
                    ngProgressFactory,
                    NST_UNREGISTER_REASON, NST_AUTH_EVENT, AuthService, LoaderService, LOADER_EVENTS) {
    $rootScope.rexExt = /(?:\.([^.]+))?$/;

    $rootScope.now = function () {
      return new Date();
    }
    // $interval(function () {
    //   $rootScope.now.setTime(Date.now());
    // }, 1000);

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

    LoaderService.addEventListener(LOADER_EVENTS.INJECTED, function () {
      $rootScope.progress.fn.start();
    });

    LoaderService.addEventListener(LOADER_EVENTS.FINISHED, function (event) {
      if (event.detail.rejected > 0) {
        $rootScope.progress.fn.reset();
      } else {
        $rootScope.progress.fn.complete();
      }
    });

    $rootScope.modals = {};

    AuthService.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function (event) {
      if (!$rootScope.modals['unauthorized'] && NST_UNREGISTER_REASON.DISCONNECT == event.detail.reason) {
        $rootScope.modals['unauthorized'] = $uibModal.open({
          animation: false,
          templateUrl: 'app/unauthorized/unauthorized.html',
          controller: 'UnauthorizedController',
          size: 'sm'
        });
      }
    });

    AuthService.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function () {
      if ($rootScope.modals['unauthorized']) {
        $rootScope.modals['unauthorized'].close();
        delete $rootScope.modals['unauthorized'];
      }
    });
  }

})();
