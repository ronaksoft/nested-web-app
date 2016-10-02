(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider.state('app.profile', {
      url: '/profile',
      templateUrl: 'app/account/profile/profile-edit.html',
      controller: 'ProfileEditController',
      controllerAs: 'ctlProfileEdit',
      // resolve: {
      //   PreviousState: [
      //     "$state",
      //     function ($state) {
      //       var currentStateData = {
      //         Name: $state.current.name,
      //         Params: $state.params,
      //         URL: $state.href($state.current.name, $state.params)
      //       };
      //       return currentStateData;
      //     }
      //   ]
      // },
    })
    .state('app.change-password', {
      url: '/change-password',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      // resolve: {
      //   PreviousState: [
      //     "$state",
      //     function ($state) {
      //       var currentStateData = {
      //         Name: $state.current.name,
      //         Params: $state.params,
      //         URL: $state.href($state.current.name, $state.params)
      //       };
      //       return currentStateData;
      //     }
      //   ]
      // },
    });

  }

})();
