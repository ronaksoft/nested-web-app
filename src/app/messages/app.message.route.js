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
        },
        options: {
          group: 'message'
        },
        onEnter: ['$stateParams', '$state', '$uibModal', 'previousState', function($stateParams, $state, $uibModal, previousState) {
          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/messages/post/post.html',
            controller: 'PostController',
            controllerAs: 'ctlPost',
            size: 'mlg',
            resolve: {
              postId: function () {
                return $stateParams.postId;
              },
              postModel : function () {
                return $stateParams.model;
              }
            }
          }).result.catch(function() {
            if (previousState.name) {
              $state.go(previousState.name, previousState.params, { notify : false });
            } else {
              $state.go(NST_DEFAULT.STATE);
            }
          });
        }],
        onExit: function($uibModalStack) {
          if ($uibModalStack) {
            $uibModalStack.dismissAll();
          }
        },
        resolve: {
          previousState : [
            "$state",
            function ($state) {
              var current = {
                name : $state.current.name,
                params : $state.params,
                url : $state.href($state.current.name, $state.params)
              };
              return current;
            }
          ]
        },
      })
      .state('app.message-chain', {
        url: '/message/:postId/chain',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
        },
        templateUrl: 'app/messages/chain/message-chain.html',
        controller: 'MessageChainController',
        controllerAs: 'ctlChain',
        options: {
          group: 'message'
        }
      })
      .state('app.place-message-chain', {
        url: '/place/:placeId/message/:postId/chain',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
        },
        templateUrl: 'app/messages/chain/message-chain.html',
        controller: 'MessageChainController',
        controllerAs: 'ctlChain',
        options: {
          group: 'message'
        }
      })
      .state('app.messages', {
        url: '/messages',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      })
      .state('app.messages-bookmarks', {
        url: '/messages/bookmarks',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      })
      .state('app.messages-bookmarks-sorted', {
        url: '/messages/bookmarks/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        },
      })
      .state('app.messages-sent', {
        url: '/messages/sent',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      })
      .state('app.messages-sent-sorted', {
        url: '/messages/sent/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      })
      .state('app.messages-sorted', {
        url: '/messages/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      })
      .state('app.place-messages', {
        url: '/places/:placeId/messages',
        params: {
          placeId : NST_DEFAULT.STATE_PARAM,
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      })
      .state('app.place-messages-unread', {
        url: '/places/:placeId/unread',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages',
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
        controllerAs: 'ctlMessages',
        options: {
          primary: true,
          group: 'message'
        }
      });

  }

})();
