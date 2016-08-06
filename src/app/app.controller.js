(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $window, $rootScope, $timeout, $state, $stateParams, $uibModalStack,
                         PUBLIC_STATE, NST_DEFAULT,
                         NstSvcAuth) {
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
      var toPublicState = PUBLIC_STATE.indexOf(toState.name) > -1;

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

    function getActivePages(state, params) {
      return {
        isSignin: [
          'signin',
          'signin-back'
        ].indexOf(state.name) > -1,
        isActivity: [
          'activity',
          'activity-bookmarks',
          'activity-bookmarks-filtered',
          'activity-filtered',
          'place-activity',
          'place-activity-filtered'
        ].indexOf(state.name) > -1,
        isMessages: [
          'messages',
          'messages-bookmarks',
          'messages-bookmarks-sorted',
          'messages-sent',
          'messages-sent-sorted',
          'messages-sorted',
          'place-messages',
          'place-messages-sorted'
        ].indexOf(state.name) > -1,
        isPlaceSettings: [
          'place-settings'
        ].indexOf(state.name) > -1,
        isPlaceAdd: [
          'place-add'
        ].indexOf(state.name) > -1,
        isCompose: [
          'compose',
          'place-compose',
          'compose-forward',
          'compose-reply-all',
          'compose-reply-sender'
        ].indexOf(state.name) > -1
      };
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

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      vm.page = getActivePages(toState, toParams);
    });
  }
})();
