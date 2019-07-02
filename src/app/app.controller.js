(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $window, $rootScope, $state, $stateParams, $interval, toastr, $location, moment, $timeout,
                         deviceDetector, $uibModal, NstSvcTranslation, NstUtility, NstThemeService, NstSvcNotification,
                         NST_DEFAULT, NST_AUTH_EVENT, NST_SRV_EVENT, NST_NOTIFICATION_EVENT, NST_CONFIG, NstSvcSystem,
                         NstSvcServer, NstSvcAuth, NstSvcLogger, NstSvcI18n, _, NstSvcNotificationFactory, $) {
    var vm = this;
    var eventReferences = [];
    var isDark = false;
    vm.stopLoadingRiver = stopLoadingRiver;
    vm.activeRiver = false;

    if (NST_CONFIG.RIVER) {
      vm.activeRiver = true;
      NstThemeService.getTheme().then(function (theme) {
        if (theme === 'yes') {
          isDark = true
        }
      });
      var riverLoadTimeout = $timeout(initRiver, 4000);
    }

    function initRiver(reset) {
      var riverService = window.RiverService.default;
      window.riverServiceInstance = new riverService({
        el: reset
         ? document.querySelector(window.riverServiceInstance.parentEl)
         : document.getElementsByClassName('river-holder')[0],
        rtl: NstSvcI18n.selectedLocale === 'fa-IR',
        theme: isDark ? 'dark' : ''
      });

      window.riverServiceInstance.onload = function() {
        var user = NstSvcAuth.user;
        window.riverServiceInstance.setUserInfo({
          firstname: user.firstName,
          lastname: user.lastName,
          workspace: NST_CONFIG.RIVER,
          phone: '+' + user.phone
        }).then();
        // srv.toggleVisible();
      }

      // window.riverServiceInstance.onDragEnter = function(msg) {
      //   var fakeOriginalEvent = new DragEvent('dragover');
      //   Object.defineProperty(fakeOriginalEvent.constructor.prototype, 'dataTransfer', {
      //     value: {}
      //   });
      //   fakeOriginalEvent.dataTransfer.getData = function() {
      //     return msg
      //   };
      //   window.dispatchEvent(fakeOriginalEvent);
      // }

      window.riverServiceInstance.destroy = function() {
        var el = document.querySelector(window.riverServiceInstance.parentEl);
        if (document.querySelector(window.riverServiceInstance.parentEl)) {
          el.remove();
        }
      }
    }

    function stopLoadingRiver() {
      $timeout.cancel(riverLoadTimeout);
      document.getElementsByClassName('river-holder')[0].remove()
    }
    var lastCounterUpdate = 0;

    NstSvcNotification.requestPermission();

    // NstSvcSystem.getLicense().then(function(license){
    //   vm.leftDays = moment.duration(moment(license.expire_date).diff(moment(new Date()))).asDays().toFixed();
    //   if (vm.leftDays < 7 && vm.leftDays > 0) {
    //     toastr.warning(NstSvcTranslation.get(NstUtility.string.format('Your license will expire in {0} days', vm.leftDays)));
    //   } else if (vm.leftDays < 1) {
    //     toastr.error(NstSvcTranslation.get('Your license is expired, All data will be removed.'), '', {
    //       timeOut: 9999999
    //     });
    //   }
    // });
    NstThemeService.applyTheme();
    // $rootScope.$emit('login-loaded');

    if (localStorage.getItem('nested.debug_mode') === 'true') {
      window.debugMode = true;
    } else {
      window.debugMode = false;
      localStorage.removeItem('nested.debug_mode_log');
    }

    $rootScope.deviceDetector = deviceDetector;
    if (deviceDetector.os_version === 'windows-xp'
      || deviceDetector.os_version === 'windows-7'
      || deviceDetector.os_version === 'windows-8'
      || deviceDetector.os === 'linux') {
      $('body').addClass('notSupportEmo');
    }
    if (deviceDetector.browser === 'safari') {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '._100vw { width: 100%;!important; }';
      document.getElementsByTagName('head')[0].appendChild(style);
    }
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
      $state.go('app.signout');
      // todo : makeit works in a other way
      $window.location.reload();
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
      // NstSvcNotificationFactory.markAsSeen(data.notificationId)
    }));

    eventReferences.push($rootScope.$on(NST_AUTH_EVENT.CHANGE_PASSWORD, function () {
      if ($state.current.name.indexOf('public.change-password') === -1) {
        $state.go('public.change-password');
      }
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
      $rootScope.affixBlocks = [];
      $window.scrollTo(0, 0);
    }

    function checkToBeAuthenticated(state, stateParams, event) {
      if (!NstSvcAuth.isInAuthorization() && _.startsWith(state.name, "app.")) {
        if (event) {
          event.preventDefault();
        }

        $state.go('public.signin-back', {back: $window.encodeURIComponent($state.href(state.name, stateParams))});
      } else {
        $rootScope.$broadcast('hide-loading-fast');
      }
    }

    $rootScope.getLastState = function () {
      var length = $rootScope.stateHistory.length;
      if (length > 2) {
        return $rootScope.stateHistory[length - 2].state.name;
      }
      return null;
    };

    function restoreLastState() {
      var last = null;
      var lastGroup = '';
      if (_.isArray($rootScope.stateHistory) && _.size($rootScope.stateHistory) > 0) {
        // restore to find a primary route
        while ($rootScope.stateHistory.length > 0) {
          last = $rootScope.stateHistory.pop();
          if (last.state.options && last.state.options.group) {
            lastGroup = last.state.options.group;
          }
          if (last.state.options && last.state.options.primary && last.state.name !== $state.current.name) {
            $rootScope.stateHistory.push(last);
            return last;
          }
        }
      }

      if ($rootScope.stateHistory.length === 0 && lastGroup === 'task') {
        return {
          default: true,
          state: $state.get('app.task.glance'),
          params: {}
        };
      }

      // return the default state if could not find any primary route
      return {
        default: true,
        state: $state.get(NST_DEFAULT.STATE),
        params: {}
      };
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
      if (
        addr.split('@')[1] &&
        (addr.split('@')[1] === NST_CONFIG.DOMAIN)) {
        addr = addr.split('@')[0];
      }

      $state.go('app.place-compose', {placeId: addr}, {notify: false});
      // Both are needed to avoid triggering other event handlers
      event.stopPropagation();
      event.preventDefault();
    });

    var backgroundModals = [];
    var maxModals = 3;

    eventReferences.push($rootScope.$on('open-compose', function () {
      if (backgroundModals.length >= maxModals) {
        toastr.error(NstSvcTranslation.get(NstUtility.string.format('You cannot have more than {0} active background modals.', maxModals)));
        $rootScope.goToLastState(true);
        return;
      }
      var uid = parseInt(_.uniqueId());
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        windowClass: 'compose-modal-element',
        // windowTopClass: 'windowTopClass ',
        openedClass: 'modal-open compose-modal',
        size: 'compose',
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        resolve: {
          modalId: uid
        }
      });
      backgroundModals.push({
        id: uid,
        order: backgroundModals.length,
        type: 'compose',
        minimize: false
      });
    }));

    eventReferences.push($rootScope.$on('open-create-task', function (event, data) {
      if (backgroundModals.length >= maxModals) {
        toastr.error(NstSvcTranslation.get(NstUtility.string.format('You cannot have more than {0} active background modals.', maxModals)));
        return;
      }
      var uid = parseInt(_.uniqueId());
      $uibModal.open({
        animation: false,
        size: 'create-task',
        templateUrl: 'app/task/pages/create-task/create-task.html',
        controller: 'CreateTaskController',
        controllerAs: 'ctrlCreateTask',
        backdropClass: 'taskdrop',
        openedClass: 'modal-open task-modal',
        windowClass: 'task-modal-element',
        resolve: {
          modalData: {
            relatedTaskId: data.relatedTaskId,
            relatedPostId: data.relatedPostId,
            callbackUrl: data.callbackUrl,
            init: data.init,
            modalId: uid
          }
        }
      });
      backgroundModals.push({
        id: uid,
        order: backgroundModals.length,
        type: 'task',
        minimize: false
      });
    }));

    eventReferences.push($rootScope.$on('minimize-background-modal', function (e, data) {
      var index = _.findIndex(backgroundModals, {id: data.id});
      if (index > -1) {
        backgroundModals[index].minimize = true;
        repositionMinimizedBackgroundModals();
      }
    }));

    eventReferences.push($rootScope.$on('close-background-modal', function (e, data) {
      var index = _.findIndex(backgroundModals, {id: data.id});
      if (index > -1) {
        if ($scope.isMainLayout && backgroundModals[index].type === 'compose' && !backgroundModals[index].minimize) {
          $rootScope.goToLastState(true);
        }
        backgroundModals.splice(index, 1);
        repositionMinimizedBackgroundModals();
      }
    }));

    function repositionMinimizedBackgroundModals() {
      setTimeout(function () {
        _.forEach(backgroundModals, function (item, index) {
          if (item.type === 'compose') {
            $('.minimize-container.compose_' + item.id).parent().css('transform', 'translateX(' + (index * -190) + 'px)');
          } else if (item.type === 'task') {
            $('.minimize-container.task_' + item.id).parent().css('transform', 'translateX(' + (index * -190) + 'px)');
          }
        });
      }, 100);
    }

    $window.onfocus = function () {
      var currentTimestamp = new Date().getTime();
      if (currentTimestamp - lastCounterUpdate > 5000) {
        $rootScope.$broadcast('reload-counters');
      }
      lastCounterUpdate = currentTimestamp;
    };

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
      windowClickEvent.off();
    });

  }
})();
