(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $uibModal,
                    ngProgressFactory,
                    NST_UNREGISTER_REASON, NST_AUTH_EVENTS, NST_LOADER_EVENTS,
                    NstSvcAuth, NstSvcLoader) {
    $rootScope.rexExt = /(?:\.([^.]+))?$/;

    $rootScope.now = function () {
      return new Date();
    };

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

    NstSvcLoader.addEventListener(NST_LOADER_EVENTS.INJECTED, function () {
      $rootScope.progress.fn.start();
    });

    NstSvcLoader.addEventListener(NST_LOADER_EVENTS.FINISHED, function (event) {
      if (event.detail.rejected > 0) {
        $rootScope.progress.fn.reset();
      } else {
        $rootScope.progress.fn.complete();
      }
    });

    $rootScope.modals = {};

    NstSvcAuth.addEventListener(NST_AUTH_EVENTS.UNAUTHORIZE, function (event) {
      if (!$rootScope.modals['unauthorized'] && NST_UNREGISTER_REASON.DISCONNECT == event.detail.reason) {
        $rootScope.modals['unauthorized'] = $uibModal.open({
          animation: false,
          templateUrl: 'app/unauthorized/unauthorized.html',
          controller: 'UnauthorizedController',
          size: 'sm'
        });
      }
    });

    NstSvcAuth.addEventListener(NST_AUTH_EVENTS.AUTHORIZE, function () {
      if ($rootScope.modals['unauthorized']) {
        $rootScope.modals['unauthorized'].close();
        delete $rootScope.modals['unauthorized'];
      }
    });
  }

})();
