(function () {
  'use strict';

  angular
    .module('nested')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($q, $scope, $window, $rootScope, $timeout, $state, $stateParams, $uibModalStack, $interval, $log,
                         hotkeys,
                         NST_PUBLIC_STATE, NST_DEFAULT, NST_PAGE, NST_SRV_ERROR, NST_AUTH_EVENT, NST_SRV_EVENT,
                         NstObject, NstSvcServer, NstSvcAuth, NstSvcLogger, NstSvcPlaceFactory, NstSvcModal) {
    var vm = this;

    vm.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;


    NstSvcServer.addEventListener(NST_SRV_EVENT.UNINITIALIZE, function (msg) {
      if (!vm.disconected) {
        vm.disconected = true;
      }
    });
    NstSvcServer.addEventListener(NST_SRV_EVENT.INITIALIZE, function () {
      if (vm.disconected) {
        vm.disconected = false;
      }
    });

    // calls $digest every 1 sec to update elapsed times.
    $interval(function () {
      $log.debug('AppController calls $digest to update passed times every 1 min.');
    }, 60 * 1000);


    /*****************************
     *****   Manage Ui View   ****
     *****************************/

    $rootScope.$watch(function () {
      return NstSvcAuth.isAuthorized()
    }, function () {
      if (!vm.disconected) {
        if (NstSvcAuth.isAuthorized()) {
          vm.loginView = true
        } else {
          vm.loginView = false
        }
      }
    });


    /*****************************
     ********* Hotkeys ***********
     *****************************/

    hotkeys.add({
      combo: 'space',
      description: 'collapse or expand sidebar',
      callback: function () {
        vm.viewSettings.sidebar.collapsed = !vm.viewSettings.sidebar.collapsed;
      }
    });
    hotkeys.add({
      combo: 'c',
      description: 'compose state',
      callback: function () {
        $state.go('place-compose');
      }
    });
    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.viewSettings = {
      sidebar: {collapsed: false},
      navbar: {collapsed: false}
    };

    vm.page = getActivePages($state.current, $state.params);

    /*****************************
     ***** Controller Methods ****
     *****************************/

    // TODO should read from cache
    $rootScope.navView = false;
    $scope.topNavOpen = false;
    $rootScope.$watch('topNavOpen', function (newValue, oldValue) {
      $scope.topNavOpen = newValue;
    });

    vm.scroll = function (event) {
      var t = event.target.scrollTop;
      $timeout(function () {
        $rootScope.navView = t > 55
      });

      if (t > 0) {
        $("#content-plus").stop().css({
          marginTop: t
        });
      } else if (t == 0) {
        $("#content-plus").stop().css({
          marginTop: 0
        });
      }
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    (function () {
      var validState = getValidState($state.current, $stateParams);
      if ($state.current.name != validState.name) {
        $state.go(validState.name, validState.params);
      }
    })();

    /*****************************
     *****    State Methods   ****
     *****************************/

    function getValidState(toState, toParams) {
      var toPublicState = NST_PUBLIC_STATE.indexOf(toState.name) > -1;

      if (NstSvcAuth.isInAuthorization()) {
        if (toPublicState) {
          return {
            name: NST_DEFAULT.STATE,
            params: {}
          };
        }
      } else if (!toPublicState) {
        if (toState.name) {
          return {
            name: 'signin-back',
            params: {
              back: $window.encodeURIComponent(angular.toJson({
                name: toState.name,
                params: toParams
              }))
            }
          };
        } else {
          return {
            name: 'signin',
            params: {}
          };
        }
      }

      return {
        name: toState.name,
        params: toParams
      };
    }

    function getActivePages(state, params, previousState, previousParams) {
      var pages = Object.keys(NST_PAGE);
      var page = {
        state: {
          current: {
            name: state.name,
            params: params,
            url: $state.href(state.name, params)
          },
          previous: {
            name: state.name,
            params: params,
            url: $state.href(state.name, params)
          }
        }
      };

      if (previousState) {
        page.state.previous = {
          name: previousState.name,
          params: previousParams,
          url: $state.href(previousState.name, previousParams)
        };
      }

      for (var k in pages) {
        var cName = NstObject.prototype.getJsName(pages[k], true);
        var isActive = NST_PAGE[pages[k]].indexOf(state.name) > -1;

        if (previousState) {
          var wasActive = NST_PAGE[pages[k]].indexOf(page.state.previous.name) > -1;

          if (wasActive) {
            page.state.previous.group = pages[k];
          }
        }

        page['is' + cName] = isActive;
        if (isActive) {
          page.state.current.group = pages[k];
        }
      }

      return page;
    }

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE_FAIL, function () {
      if (-1 == NST_PAGE.SIGNIN.indexOf($state.current.name)) {
        var validState = getValidState($state.current, $state.params);
        $state.go(validState.name, validState.params);
      }
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      $uibModalStack.dismissAll();

      var validState = getValidState(toState, toParams);
      if (toState.name != validState.name) {
        $rootScope.$broadcast('$stateChangeError');
        event.preventDefault();
        $state.go(validState.name, validState.params);
      }
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toParams.placeId && NST_DEFAULT.STATE_PARAM != toParams.placeId) {
        NstSvcPlaceFactory.get(toParams.placeId).catch(function (error) {
          if (error.getCode() === NST_SRV_ERROR.UNAVAILABLE) {
            NstSvcModal.error('Does not exist!', 'We are sorry, but the place you are looking for can not be found!').catch(function () {
              // This handles dismissed modal
              return $q(function (res) {
                res(false);
              });
            }).then(function () {
              if (fromState.name) {
                $state.go(fromState.name, fromParams);
              } else {
                $state.go(NST_DEFAULT.STATE);
              }
            });
          } else if (error.getCode() === NST_SRV_ERROR.ACCESS_DENIED) {
            NstSvcModal.error('Access denied!', 'You are not allowed to be here!').catch(function () {
              // This handles dismissed modal
              return $q(function (res) {
                res(false);
              });
            }).then(function () {
              if (fromState.name) {
                $state.go(fromState.name, fromParams);
              } else {
                $state.go(NST_DEFAULT.STATE);
              }
            });
          }
        });
      }
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      vm.page = getActivePages(toState, toParams, fromState, fromParams);
    });
  }
})();
