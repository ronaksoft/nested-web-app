(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AppController', AppController);

  /** @ngInject */
  function AppController($rootScope, $timeout, $state, $location, NstSvcAuth, NST_DEFAULT) {
    var vm = this;

    vm.navView = false;

    // FIXME: NEEDS REWRITE COMPLETELY
    $rootScope.msgScroll = {
      callbacks: {
        whileScrolling:function(){
          var t = -this.mcs.top;
          $timeout(function () { vm.navView = t > 55; });

          $('.nst-navbar').toggleClass('tiny', t > 55);

          if ( t > 0) {
            $("#content-plus").stop().css({
              marginTop: t
            });
          } else if(t == 0){
            $("#content-plus").stop().css({
              marginTop: 0
            });
          }


        },
        onTotalScroll:function () {
          //TODO load activities
        },
        onTotalScrollOffset:10,
        alwaysTriggerOffsets:false
      }
    };

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
