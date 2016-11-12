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
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        options : {
          group : 'compose',
        }
      })
      .state('app.place-compose', {
        url: '/compose/:placeId',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        options : {
          group : 'compose',
        }
      })
      .state('app.compose-forward', {
        url: '/forward/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        options : {
          group : 'compose',
        }
      })
      .state('app.compose-reply-all', {
        url: '/reply/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        options : {
          group : 'compose',
        }
      })
      .state('app.compose-reply-sender', {
        url: '/reply/:postId/sender',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        options : {
          group : 'compose',
        }
      })

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('app.place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
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
          placeId: NST_DEFAULT.STATE_PARAM
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
            $rootScope.goToLastState();
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

      .state('app.activity', {
        url: '/activity',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.activity-bookmarks', {
        url: '/activity/bookmarks',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.activity-bookmarks-filtered', {
        url: '/activity/bookmarks/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.activity-filtered', {
        url: '/activity/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.place-activity', {
        url: '/places/:placeId/activity',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
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
        templateUrl: 'app/events/events.html',
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
