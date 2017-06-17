(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($q, $scope, $window, $rootScope, $timeout, $state, $stateParams, $uibModalStack, $interval, $log, $injector,
                         hotkeys, deviceDetector, NstSvcInteractionTracker,
                         NST_DEFAULT, NST_AUTH_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_FACTORY_EVENT, NST_CONFIG,
                         NstSvcServer, NstSvcAuth, NstSvcLogger, NstSvcI18n, NstSvcNotification, NstSvcNotificationFactory,
                         NstObject) {
    var vm = this;

    vm.showLoadingScreen = true;
    vm.viewSettings = {
      sidebar: {collapsed: true},
      navbar: {collapsed: false}
    };

    $rootScope.navView = false;
    $rootScope.cardCtrls = [];
    $rootScope.staticNav = true;
    $rootScope.topNavOpen = false;
    $rootScope._direction = NstSvcI18n.getLocale()._direction || "ltr";
    $rootScope.deviceDetector = deviceDetector;
    if ( deviceDetector.os_version === 'windows-xp'
      || deviceDetector.os_version === 'windows-7'
      || deviceDetector.os_version === 'windows-8-1'
      || deviceDetector.os_version === 'windows-8'
      || deviceDetector.os === 'linux' ) {
        $('.wdt-emoji-popup').addClass('notSupportEmo');
    }
    $rootScope._track = trackBehaviour;



    /** APPLICATION EVENT LISTENERS **/
    NstSvcServer.addEventListener(NST_SRV_EVENT.DISCONNECT, function (msg) {
      vm.disconnected = true;
    });
    NstSvcServer.addEventListener(NST_SRV_EVENT.CONNECT, function (msg) {
      vm.disconnected = false;
      vm.showLoadingScreen = false;
    });
    NstSvcServer.addEventListener(NST_SRV_EVENT.UNINITIALIZE, function (msg) {
      vm.disconnected = true;
    });
    NstSvcServer.addEventListener(NST_SRV_EVENT.INITIALIZE, function () {
      // Hide and remove initial loading
      // this is placed here to make sure the WS has been connected
      vm.disconnected = false;

    });


    /** ANGULAR EVENT LISTENERS **/
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      toggleSidebar(toState, toParams);
    });

    $scope.$on('show-loading', function () {
      vm.showLoadingScreen = true;
    });
    $scope.$on('collapse-sidebar', function () {
      vm.viewSettings.sidebar.collapsed = !vm.viewSettings.sidebar.collapsed
    });



    /** APPLICATION WATCHER **/
    $scope.$watch(function () {
      return vm.viewSettings.sidebar.collapsed
    }, function () {
      var tooltip = $('body').find('.tooltip');
      if (tooltip.is(":visible")) {
        tooltip.first().hide()
      } else {
        tooltip.first().show()

      }
    });


    /** APPLICATION UI HELPER **/
    // calls $digest every 1 sec to update elapsed times.
    $interval(function () {
      NstSvcLogger.debug('AppController calls $digest to update passed times every 1 min.');
    }, 60 * 1000);

    function toggleSidebar(state, params) {
      if (state.options && state.options && state.options.fullscreen) {
        vm.viewSettings.sidebar.hidden = true;
      } else if (params && params.placeId) {
        vm.viewSettings.sidebar.hidden = false;
        vm.viewSettings.sidebar.collapsed = false;
      } else {
        vm.viewSettings.sidebar.hidden = false;
        vm.viewSettings.sidebar.collapsed = true;
      }
    }




    toggleSidebar($state.current, $state.params);



    /** CHANGE ROUTE HELPER **/

    function checkToBeAuthenticated(state, stateParams, event) {
      if (!NstSvcAuth.isInAuthorization() && _.startsWith(state.name, "app.")) {
        if (event) {
          event.preventDefault();
        }

        $state.go('public.signin-back', {back: $window.encodeURIComponent($state.href(state.name, stateParams))});
      }
    }

    function scrollTopBody() {
      $window.scrollTo(0, 0);
    }


    function restoreLastState() {
      var last = null;
      // restore to find a primary route
      while ($rootScope.stateHistory.length > 0) {
        last = $rootScope.stateHistory.pop();
        if (last.state.options && last.state.options.primary && last.state.name !== $state.current.name) {
          $rootScope.stateHistory.push(last);
          return last;
        }
      }

      // return the default state if could not find any primary route
      return {
        default: true,
        state: $state.get(NST_DEFAULT.STATE),
        params: {}
      };
    }


    checkToBeAuthenticated($state.current, $stateParams);
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      $('.wdt-emoji-popup.open').removeClass('open');
      $rootScope.$broadcast('reload-counters');
      checkToBeAuthenticated(toState, toParams, event);
      scrollTopBody();
    });

    $rootScope.goToLastState = function (disableNotify, defaultState) {
      var previous = defaultState || restoreLastState();

      if (disableNotify && !previous.default) {
        $state.go(previous.state.name, previous.params, {notify: false});
      } else {
        $state.go(previous.state.name, previous.params);
      }

    };

    $rootScope.$on(NST_AUTH_EVENT.CHANGE_PASSWORD, function () {
      if($state.current.name.indexOf('public.recover-password') === -1)
        $state.go('public.recover-password');

    });

    $rootScope.$on(NST_AUTH_EVENT.SESSION_EXPIRE, function () {
        location.href = '/signout.html';
    });


    NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE_FAIL, function () {
      $state.go('public.signin');
    });

    //Handle all mailto links
    $(window).on('click', function (event) {
      if (!$(event.target).is('a[href^="mailto"]')) {
        return;
      }

      var addr = $(event.target).attr('href').substr(7);
      //TODO:: check domain base on config
      if (
        addr.split('@')[1] &&
        (addr.split('@')[1] === NST_CONFIG.DOMAIN )) {
        addr = addr.split('@')[0];
      }

      $state.go('app.place-compose', {placeId: addr}, {notify: false});
      // Both are needed to avoid triggering other event handlers
      event.stopPropagation();
      event.preventDefault();
    });

    function trackBehaviour(category, behaviour, value) {
      NstSvcInteractionTracker.trackEvent(category, behaviour, value);
    }

    // Listen to notification behavior

    function viewPost(postId) {
      $state.go('app.message', {postId: postId}, {notify: false});
    }

    function openPlace(placeId) {
      $state.go('app.place-messages', {placeId: placeId});
    }


    //Receive and handle new external push notification after user click on desktop notification
    NstSvcNotification.addEventListener(NST_NOTIFICATION_FACTORY_EVENT.EXTERNAL_PUSH_ACTION, function (event) {
      switch (event.detail.action) {
        case NST_NOTIFICATION_FACTORY_EVENT.OPEN_PLACE:
          openPlace(event.detail.placeId);
          break;
        case NST_NOTIFICATION_FACTORY_EVENT.OPEN_POST_VIEW:
          viewPost(event.detail.postId);
          break;
      }
      NstSvcNotificationFactory.markAsSeen(event.detail.notificationId)
    })

    $window.onfocus = function () {
      $rootScope.$broadcast('reload-counters');
    };

  }
})();
