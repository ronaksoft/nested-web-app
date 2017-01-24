(function() {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {

    $stateProvider
      .state('app', {
        abstract : true,
        templateUrl : 'app/app-layout.html',
        controller : 'AppController',
        controllerAs : 'ctlApp'
      })

      /*****************************
       *****   Compose Routes   ****
       *****************************/

      .state('app.compose', {
        url: '/compose',
        params: {
          attachments : []
        },
        options: {
          group : 'compose',
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          $uibModal.open({
            animation: false,
            size: 'compose',
            templateUrl: 'app/pages/compose/main.html',
            controller: 'ComposeController',
            controllerAs: 'ctlCompose'
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

      .state('app.place-compose', {
        url: '/compose/:placeId',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          attachments : []
        },
        options: {
          group : 'compose',
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          $uibModal.open({
            animation: false,
            size: 'compose',
            templateUrl: 'app/pages/compose/main.html',
            controller: 'ComposeController',
            controllerAs: 'ctlCompose'
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
      .state('app.compose-forward', {
        url: '/forward/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          attachments : []
        },
        options: {
          group : 'compose',
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          $uibModal.open({
            animation: false,
            size: 'compose',
            templateUrl: 'app/pages/compose/main.html',
            controller: 'ComposeController',
            controllerAs: 'ctlCompose'
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
      .state('app.compose-reply-all', {
        url: '/reply/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          attachments : []
        },
        options: {
          group : 'compose',
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          $uibModal.open({
            animation: false,
            size: 'compose',
            templateUrl: 'app/pages/compose/main.html',
            controller: 'ComposeController',
            controllerAs: 'ctlCompose'
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
      .state('app.compose-reply-sender', {
        url: '/reply/:postId/sender',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          attachments : []
        },
        options: {
          group : 'compose',
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          $uibModal.open({
            animation: false,
            size: 'compose',
            templateUrl: 'app/pages/compose/main.html',
            controller: 'ComposeController',
            controllerAs: 'ctlCompose'
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

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('app.place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        options : {
          group : 'settings'
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          var modal = $uibModal.open({
            animation: false,
            size: 'lg-white',
            templateUrl: 'app/place/settings/place-settings.html',
            controller: 'PlaceSettingsController',
            controllerAs: 'ctlSettings'
          }).result.catch(function() {
            $rootScope.goToLastState(true, {
              state : $state.get('app.place-messages'),
              params : { placeId : $stateParams.placeId },
              default : true
            });
          });
        }],
        onExit: function($uibModalStack) {
          if ($uibModalStack) {
            $uibModalStack.dismissAll();
          }
        }
      })
      .state('app.place-create', {
        url: '/places/:placeId/create',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          isOpenPlace: null,
          isClosePlace: null
        },
        options : {
          group : 'settings'
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
          var modal = $uibModal.open({
            animation: false,
            size: 'lg-white',
            templateUrl: 'app/place/create/place-create.html',
            controller: 'PlaceCreateController',
            controllerAs: 'ctlCreate'

          }).result.catch(function() {
            $rootScope.goToLastState(true);
          });
        }],
        onExit: function($uibModalStack,$stateParams ,$state) {
          if ($uibModalStack) {
            $uibModalStack.dismissAll();
          }
        }
      })

      /*****************************
       *****  Activity Routes   ****
       *****************************/

      // .state('app.activity', {
      //   url: '/activity',
      //   templateUrl: 'app/activity/activity.html',
      //   controller: 'ActivityController',
      //   controllerAs: 'ctlActivity',
      //   options : {
      //     primary : true,
      //     group : 'activity',
      //     feed : true
      //   }
      // })
      .state('app.activity-favorites', {
        url: '/activity/favorites',
        templateUrl: 'app/activity/activity.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity',
          feed : true
        }
      })
      .state('app.activity-favorites-filtered', {
        url: '/activity/favorites/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/activity/activity.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity',
          feed : true
        }
      })
      .state('app.activity-filtered', {
        url: '/activity/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/activity/activity.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity',
          feed : true
        }
      })
      .state('app.place-activity', {
        url: '/places/:placeId/activity',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/activity/activity.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.place-activity-filtered', {
        url: '/places/:placeId/activity/:filter',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/activity/activity.html',
        controller: 'ActivityController',
	      controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })


      /*****************************
       *****   Search Routes    ****
       *****************************/

      .state('app.search', {
        url: '/search/:search',
        params: {
          search: NST_DEFAULT.STATE_PARAM
        },
        reloadOnSearch : false,
        templateUrl: 'app/messages/search/search.html',
        controller: 'SearchController',
        controllerAs: 'ctlSearch',
        options : {
          group : 'message',
          primary : true
        }
      });

    $urlRouterProvider.otherwise('/messages');
  }

})();
