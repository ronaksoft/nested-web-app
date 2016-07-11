(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $interval, $uibModal, $window, $timeout,
                    ngProgressFactory,
                    UNREGISTER_REASON, AUTH_EVENTS, AuthService, LoaderService, LOADER_EVENTS) {
    $rootScope.rexExt = /(?:\.([^.]+))?$/;

    $rootScope.now = function () {
      return new Date();
    };

    var timers = [];
    angular.element($window).bind("scroll", function(e) {
      timers.forEach(function(promises) {
        $timeout.cancel(promises);
      });
      var $sidebar = $("#content-plus"),
        topPadding = 150;

      var timer = $timeout(
        function() {
          if (150 > e.currentTarget.scrollY > 0) {
            $sidebar.stop().css({
              marginTop: e.currentTarget.scrollY
            });
          } else if (e.currentTarget.scrollY > topPadding) {
            $sidebar.stop().css({
              marginTop: e.currentTarget.scrollY - 51
            });
          } else if (e.currentTarget.scrollY == 0){
            $sidebar.stop().css({
              marginTop: 0
            });
          }
        },
        50
      );
      timers.push(timer);
      timer;
      $('.nst-navbar').toggleClass('tiny', e.currentTarget.scrollY > 55);
    });
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

    AuthService.addEventListener(AUTH_EVENTS.UNAUTHORIZE, function (event) {
      if (!$rootScope.modals['unauthorized'] && UNREGISTER_REASON.DISCONNECT == event.detail.reason) {
        $rootScope.modals['unauthorized'] = $uibModal.open({
          animation: false,
          templateUrl: 'app/unauthorized/unauthorized.html',
          controller: 'UnauthorizedController',
          size: 'sm'
        });
      }
    });

    AuthService.addEventListener(AUTH_EVENTS.AUTHORIZE, function () {
      if ($rootScope.modals['unauthorized']) {
        $rootScope.modals['unauthorized'].close();
        delete $rootScope.modals['unauthorized'];
      }
    });
  }

})();
