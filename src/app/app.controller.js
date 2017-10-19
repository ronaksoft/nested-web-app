(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $window, $rootScope, $state, $stateParams, $interval, toastr,
                         deviceDetector, NstSvcInteractionTracker, $uibModal, NstSvcTranslation, NstUtility,
                         NST_DEFAULT, NST_AUTH_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_EVENT, NST_CONFIG,
                         NstSvcServer, NstSvcAuth, NstSvcLogger, NstSvcI18n, _, NstSvcNotificationFactory, $) {
    var vm = this;
    var eventReferences = [];

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
      || deviceDetector.os_version === 'windows-8'
      || deviceDetector.os === 'linux' ) {
        $('body').addClass('notSupportEmo');
    }
    if ( deviceDetector.browser === 'safari') {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '._100vw { width: 100%;!important; }';
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    $rootScope._track = trackBehaviour;
    $rootScope.goToLastState = function (disableNotify, defaultState) {
      var previous = defaultState || restoreLastState();

      if (disableNotify && !previous.default) {
        $state.go(previous.state.name, previous.params, {notify: false});
      } else {
        $state.go(previous.state.name, previous.params);
      }

    };

    $scope.isMainLayout = $state.current.options && $state.current.options.group !== 'settings' && $state.current.options.group !== 'task';
    $scope.isTaskLayout = $state.current.options && $state.current.options.group === 'task';

    checkToBeAuthenticated($state.current, $stateParams);

    $interval(function () {
      NstSvcLogger.debug('AppController calls $digest to update passed times every 1 min.');
    }, 60 * 1000);

    NstSvcServer.addEventListener(NST_SRV_EVENT.DISCONNECT, function () {
      vm.disconnected = true;
    });

    NstSvcServer.addEventListener(NST_SRV_EVENT.CONNECT, function () {
      vm.disconnected = false;
      vm.showLoadingScreen = false;
    });

    NstSvcServer.addEventListener(NST_SRV_EVENT.UNINITIALIZE, function () {
      vm.disconnected = true;
    });

    NstSvcServer.addEventListener(NST_SRV_EVENT.INITIALIZE, function () {
      // Hide and remove initial loading
      // this is placed here to make sure the WS has been connected
      vm.disconnected = false;

    });

    eventReferences.push($rootScope.$on(NST_AUTH_EVENT.AUTHORIZE_FAIL, function () {
      $state.go('public.signin');
    }));

    eventReferences.push($rootScope.$on(NST_NOTIFICATION_EVENT.EXTERNAL_PUSH_ACTION, function (e, data) {
      switch (data.action) {
        case NST_NOTIFICATION_EVENT.OPEN_PLACE:
          openPlace(data.placeId);
          break;
        case NST_NOTIFICATION_EVENT.OPEN_POST_VIEW:
          viewPost(data.postId);
          break;
      }
      NstSvcNotificationFactory.markAsSeen(data.notificationId)
    }));

    eventReferences.push($scope.$on('show-loading', function () {
      vm.showLoadingScreen = true;
    }));

    eventReferences.push($rootScope.$on(NST_AUTH_EVENT.CHANGE_PASSWORD, function () {
      if($state.current.name.indexOf('public.change-password') === -1)
      $state.go('public.change-password');

    }));

    eventReferences.push($rootScope.$on(NST_AUTH_EVENT.SESSION_EXPIRE, function () {
      location.href = '/signout.html';
    }));

    eventReferences.push($rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      resetUITemporaryData()
      $scope.isMainLayout = toState.options && toState.options.group !== 'settings' && toState.options.group !== 'task';
      $scope.isTaskLayout = toState.options && toState.options.group === 'task';
      $('.wdt-emoji-popup.open').removeClass('open');
      // $rootScope.$broadcast('reload-counters');
      checkToBeAuthenticated(toState, toParams, event);
    }));

    function resetUITemporaryData() {
      $rootScope.cardCtrls = [];
      $window.scrollTo(0, 0);
    }

    function checkToBeAuthenticated(state, stateParams, event) {
      if (!NstSvcAuth.isInAuthorization() && _.startsWith(state.name, "app.")) {
        if (event) {
          event.preventDefault();
        }

        $state.go('public.signin-back', {back: $window.encodeURIComponent($state.href(state.name, stateParams))});
      }
    }

    function restoreLastState() {
      var last = null;
      if (_.isArray($rootScope.stateHistory) && _.size($rootScope.stateHistory) > 0) {
        // restore to find a primary route
        while ($rootScope.stateHistory.length > 0) {
          last = $rootScope.stateHistory.pop();
          if (last.state.options && last.state.options.primary && last.state.name !== $state.current.name) {
            $rootScope.stateHistory.push(last);
            return last;
          }
        }
      }

      // return the default state if could not find any primary route
      return {
        default: true,
        state: $state.get(NST_DEFAULT.STATE),
        params: {}
      };
    }

    function trackBehaviour(category, behaviour, value) {
      NstSvcInteractionTracker.trackEvent(category, behaviour, value);
    }

    function viewPost(postId) {
      $state.go('app.message', {postId: postId}, {notify: false});
    }

    function openPlace(placeId) {
      $state.go('app.place-messages', {placeId: placeId});
    }

    var windowClickEvent = $(window).on('click', function (event) {
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

    var composeModals = [];
    var maxModals = 3;

    eventReferences.push($rootScope.$on('open-compose', function () {
      if (composeModals.length >= maxModals) {
        toastr.error(NstSvcTranslation.get(NstUtility.string.format('You cannot have more than {0} active compose modals.', maxModals)));
        $rootScope.goToLastState(true);
        return;
      }
      var uid = parseInt(_.uniqueId());
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'compose',
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        openedClass: 'modal-open compose-modal active-compose',
        controllerAs: 'ctlCompose',
        resolve: {
          modalId: uid
        }
      }).result.catch(function () {
        $rootScope.goToLastState(true);
      });
      composeModals.push({
        id: uid,
        order: composeModals.length
      });
    }));

    eventReferences.push($rootScope.$on('minimize-compose', function () {
      repositionMinimizedComposeModals();
    }));

    eventReferences.push($rootScope.$on('close-compose', function (e, data) {
      var index = _.findIndex(composeModals, data.id, 'id');
      composeModals.splice(index, 1);
      repositionMinimizedComposeModals();
    }));

    function repositionMinimizedComposeModals() {
      setTimeout(function () {
        _.forEach(composeModals, function (item) {
          $('.minimize-container.compose_' + item.id).parent().css('transform', 'translateX(' + (item.order * -160) + 'px)');
        });
      }, 100);
    }

    $window.onfocus = function () {
      $rootScope.$broadcast('reload-counters');
    };

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
      windowClickEvent.off();
    });

  }
})();
