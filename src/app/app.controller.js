(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $window, $rootScope, $timeout, $state, $stateParams, $uibModalStack,
                         NST_PUBLIC_STATE, NST_DEFAULT, NST_PAGE, NST_SRV_ERROR,
                         NstSvcAuth, NstSvcPlaceFactory, NstSvcModal) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.viewSettings = {
      sidebar : {collapsed: false},
      navbar : {collapsed:false}
    };

    vm.page = getActivePages($state.current, $state.params);

    /*****************************
     ***** Controller Methods ****
     *****************************/

    // TODO should read from cache
    $rootScope.navView = false;
    $scope.topNavOpen = false;
    $rootScope.$watch('topNavOpen',function (newValue,oldValue) {
      $scope.topNavOpen = newValue;
    });

    vm.scroll = function(event){
      var t = event.target.scrollTop;
      $timeout(function () {$rootScope.navView = t > 55});

      if ( t > 0) {
        $("#content-plus").stop().css({
          marginTop: t
        });
      } else if(t == 0){
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
            name: NST_DEFAULT.STATE
          };
        }
      } else {
        if (!toPublicState) {
          return {
            name: 'signin-back',
            params: {
              back: $window.encodeURIComponent(angular.toJson({
                name: toState.name,
                params: toParams
              }))
            }
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
        var cName = pages[k].toLowerCase().split('').map(function (v, i) { return 0 == i ? v.toUpperCase() : v; }).join('');
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

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      $uibModalStack.dismissAll();

      var validState = getValidState(toState, toParams);
      if (toState.name != validState.name) {
        $rootScope.$broadcast('$stateChangeError');
        event.preventDefault();
        $state.go(validState.name, validState.params);
      }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      if (toParams.placeId && NST_DEFAULT.STATE_PARAM != toParams.placeId) {
        NstSvcPlaceFactory.get(toParams.placeId).catch(function (error) {
          if (error.getCode() === NST_SRV_ERROR.UNAVAILABLE) {
            NstSvcModal.error('Does not exist!','We are sorry, but the place you are looking for can not be found!').then(function (result) {
              $state.go(getDefaultRelatedState(toState));
            });
          } else if (error.getCode() === NST_SRV_ERROR.ACCESS_DENIED) {
            NstSvcModal.error('Access denied!','You are not allowed to be here!').then(function (result) {
              $state.go(getDefaultRelatedState(toState));
            });
          }
        });
      }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      vm.page = getActivePages(toState, toParams, fromState, fromParams);
    });

    function getDefaultRelatedState(state) {
      var group = _.findKey(NST_PAGE, function (pages) {
        return _.includes(pages, state.name);
      });

      if ('ACTIVITY' === group) {
        return $state.get('activity');
      } else if ('MESSAGES' === group) {
        return $state.get('messages');
      } else {
        return $state.get(NST_DEFAULT.STATE);
      }
    }
  }
})();
