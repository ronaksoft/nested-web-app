(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
      .state('app.message', {
        url: '/message/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          model : null,
          trusted: false
        },
        options: {
          group: 'message'
        },
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
           $uibModal.open({
            animation: false,
            templateUrl: 'app/messages/post/post.html',
            controller: 'PostController',
            controllerAs: 'ctlPost',
            size: 'post-view',
            windowClass: 'uib-wrapper-post-view',
            resolve: {
              selectedPostId: function () {
                return $stateParams.postId;
              },
              postModel : function () {
                return $stateParams.model;
              }
            }
          }).result.catch(function(result) {
            if (result !== true) {
              $rootScope.goToLastState(true);
            }
          });
        }]
        // onExit: function($uibModal) {
        //   if ($uibModalStack) {
        //     $uibModal.dismiss();
        //   }
        // }
      })
      .state('print', {
        url: '/print/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          model : null,
          trusted: false
        },
        options: {
          group: 'print'
        },
        templateUrl: 'app/messages/print/print.html',
        controller: 'PrintController',
        controllerAs: 'ctlPost',
      })
      .state('app.messages-bookmarked', {
        url: '/bookmarks',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'bookmarked',
          feed : true
        }
      })
      .state('app.messages-favorites', {
        url: '/feed',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'message',
          feed : true,
          favoritePlace : true
        }
      })
      .state('app.messages-favorites-sorted', {
        url: '/feed/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'message',
          feed : true
        }
      })
      .state('app.messages-sent', {
        url: '/shared',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'sent'
        }
      })
      .state('app.place-messages', {
        url: '/places/:placeId/messages',
        params: {
          placeId : NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'posts'
        }
      })
      .state('app.place-messages-unread', {
        url: '/places/:placeId/unread',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options : {
          group : 'message'
        }
      })
      .state('app.place-messages-sorted', {
        url: '/places/:placeId/messages/:sort',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'message'
        }
      });

  }

})();
