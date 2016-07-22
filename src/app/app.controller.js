(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($rootScope, $state, $location, NstSvcAuth, NST_DEFAULT) {
    var vm = this;
    if (NstSvcAuth.isInAuthorization()) {
      $state.go(NST_DEFAULT.STATE);

    } else {
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

      if (nextState.name === 'signin' || nextState.name === 'home'){
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
