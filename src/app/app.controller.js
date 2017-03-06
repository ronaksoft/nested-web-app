(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($q, $scope, $window, $rootScope, $timeout, $state, $stateParams, $uibModalStack, $interval, $log, $injector,
                         hotkeys, deviceDetector, NstSvcInteractionTracker,
                         NST_DEFAULT, NST_AUTH_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_FACTORY_EVENT,
                         NstSvcServer, NstSvcAuth, NstSvcLogger, NstSvcI18n, NstSvcNotification, NstSvcNotificationFactory,
                         NstObject) {
    var vm = this;

    vm.loginView = true;
    $rootScope.cardCtrls = [];
    $rootScope.staticNav = true;
    vm.showLoadingScreen = true;
    $rootScope.topNavOpen = false;
    $rootScope._direction = NstSvcI18n.getLocale()._direction || "ltr";
    $rootScope.deviceDetector = deviceDetector;
    $rootScope._track = trackBehaviour;


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

    $scope.$on('show-loading', function () {
      vm.showLoadingScreen = true;
    });
    $scope.$on('collapse-sidebar', function () {
      vm.viewSettings.sidebar.collapsed = !vm.viewSettings.sidebar.collapsed
    });

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


    // calls $digest every 1 sec to update elapsed times.
    $interval(function () {
      NstSvcLogger.debug('AppController calls $digest to update passed times every 1 min.');
    }, 60 * 1000);

    vm.viewSettings = {
      sidebar: {collapsed: true},
      navbar: {collapsed: false}
    };

    $rootScope.navView = false;

    NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE_FAIL, function () {

      // if (-1 == NST_PAGE.SIGNIN.indexOf($state.current.name)) {
      //   var validState = getValidState($state.current, $state.params);
      //   $state.go(validState.name, validState.params);
      // }

    });


    var NstSvcPlaceFactory = null;
    if ($injector.has('NstSvcPlaceFactory')) {
      NstSvcPlaceFactory = $injector.get('NstSvcPlaceFactory');
    }


    toggleSidebar($state.current, $state.params);

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      toggleSidebar(toState, toParams);
    });

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

    checkToBeAuthenticated($state.current, $stateParams);
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      checkToBeAuthenticated(toState, toParams, event);
      scrollTopBody();
    });

    function scrollTopBody() {
      $window.scrollTo(0, 0);
    }

    function checkToBeAuthenticated(state, stateParams, event) {
      if (!NstSvcAuth.isInAuthorization() && _.startsWith(state.name, "app.")) {
        if (event) {
          event.preventDefault();
        }
        $state.go('public.signin-back', {back: angular.toJson({name: state.name, params: stateParams})});
      }
    }

    function restoreLastState() {
      var last = null;
      // restore to find a primary route
      while ($rootScope.stateHistory.length > 0) {
        last = $rootScope.stateHistory.pop();
        if (last.state.options && last.state.options.primary) {
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

    $rootScope.goToLastState = function (disableNotify, defaultState) {
      var previous = defaultState || restoreLastState();

      if (disableNotify && !previous.default) {
        $state.go(previous.state.name, previous.params, {notify: false});
      } else {
        $state.go(previous.state.name, previous.params);
      }

    };


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
        (addr.split('@')[1] === 'nested.me' || addr.split('@')[1] === 'nested.ronaksoftware.com')) {
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


  }
})();
