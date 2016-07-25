(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($scope, $rootScope, $timeout, $state, $location, NstSvcAuth, NST_DEFAULT) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.page = {
      isActivity: [
        'activity',
        'activity-bookmarks',
        'activity-bookmarks-filtered',
        'activity-filtered',
        'place-activity',
        'place-activity-filtered'
      ].indexOf($state.current.name) > -1,
      isMessages: [
        'messages',
        'messages-bookmarks',
        'messages-bookmarks-sorted',
        'messages-sent',
        'messages-sent-sorted',
        'messages-sorted',
        'place-messages',
        'place-messages-sorted'
      ].indexOf($state.current.name) > -1,
      isPlaceSettings: [
        'place-settings'
      ].indexOf($state.current.name) > -1,
      isPlaceAdd: [
        'place-add'
      ].indexOf($state.current.name) > -1,
      isCompose: [
        'compose',
        'place-compose',
        'compose-forward',
        'compose-reply-all',
        'compose-reply-sender'
      ].indexOf($state.current.name) > -1
    };

    //todo should read from cache
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

    if (NstSvcAuth.isInAuthorization()) {
      $state.go(NST_DEFAULT.STATE);
    } else {
      // TODO: Handle this via $state
      var previousLocation = $location.path();
      if (previousLocation === '/signin') {
        previousLocation = '';
      }
      $location.search({
        back: previousLocation
      });
      $location.path('/signin').replace();
    }

    $rootScope.$on('$stateChangeStart', function(event, nextState, currentState) {
      if (['signin', 'home'].indexOf(nextState.name) > -1) {
        return;
      }

      if (!NstSvcAuth.isInAuthorization(nextState)) {
        $rootScope.$broadcast('$stateChangeError');
        event.preventDefault();
        $state.go('signin');
      }
    });
  }
})();
