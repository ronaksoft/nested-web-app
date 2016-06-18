(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $interval, $uibModal, UNAUTH_REASON, AUTH_EVENTS, AuthService, ngProgressFactory) {
    $rootScope.rexExt = /(?:\.([^.]+))?$/;

    $rootScope.now = new Date();
    $interval(function () {
      $rootScope.now.setTime(Date.now());
    }, 1000);

    $rootScope.progressbar = ngProgressFactory.createInstance();
    $rootScope.progressbar.setHeight('5px');
    //$scope.progressbar.setColor('#14D766');
    $rootScope.completeProgress = function($event) {
      $event.preventDefault();
      $rootScope.progressbar.complete();
    };
    $rootScope.stopProgress = function($event) {
      $event.preventDefault();
      $rootScope.progressbar.stop();
    };
    $rootScope.resetProgress = function($event) {
      $rootScope.progressbar.reset();
      $event.preventDefault();
    };

    $rootScope.modals = {};

    AuthService.addEventListener(AUTH_EVENTS.UNAUTHENTICATE, function (event) {
      console.log('Reason', event);
      if (!($rootScope.modals['unauthorized'] || UNAUTH_REASON.LOGOUT == event.detail.reason)) {
        $rootScope.modals['unauthorized'] = $uibModal.open({
          animation: false,
          templateUrl: 'app/unauthorized/unauthorized.html',
          controller: 'UnauthorizedController',
          size: 'sm'
        });
      }
    });

    AuthService.addEventListener(AUTH_EVENTS.AUTHENTICATE, function () {
      if ($rootScope.modals['unauthorized']) {
        $rootScope.modals['unauthorized'].close();
        delete $rootScope.modals['unauthorized'];
      }
    });
  }

})();
