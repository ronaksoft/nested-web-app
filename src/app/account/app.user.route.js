(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
    .state('app.profile', {
      url: '/profile',
      absolute: true,
      options : {
        group : 'profile'
      },
      onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/account/profile/profile-edit.html',
          controller: 'ProfileEditController',
          controllerAs: 'ctlProfileEdit',
          size: 'profile-set-view',
          resolve: {
      
          }
        }).result.catch(function() {
          $rootScope.goToLastState(true);
        });
      }],
      onExit: function($uibModalStack, $state) {
        if ($uibModalStack) {
          $uibModalStack.dismissAll();
        }
      }
    })
    .state('app.profile.setting',{
      url: '/profile/setting',
      templateUrl: 'app/account/profile/partials/setting.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    })
    .state('app.profile.password',{
      url: '/profile/password',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    })
    .state('app.profile.session',{
      url: '/profile/session',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    })
    .state('app.profile.notification',{
      url: '/profile/notification',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    })
    .state('app.profile.language',{
      url: '/profile/language',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    })
    .state('app.change-password', {
      url: '/change-password',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    });

  }

})();
