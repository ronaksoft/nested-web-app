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
        onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', 'NST_PAGE', function($rootScope, $stateParams, $state, $uibModal, NST_PAGE) {
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
              if (NST_PAGE.MESSAGES.indexOf($rootScope.getLastState()) > -1) {
                $rootScope.goToLastState(true);
              } else {
                $rootScope.goToLastState(false);
              }
            }
          })
        }]
        // onExit: function($uibModal) {
        //   if ($uibModalStack) {
        //     $uibModal.dismiss();
        //   }
        // }
      })
      .state('print-post', {
        url: '/print/post/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          model : null,
          trusted: false
        },
        options: {
          group: 'print'
        },
        templateUrl: 'app/messages/print/print-post.html',
        controller: 'PrintPostController',
        controllerAs: 'ctlPost'
      })
      .state('print-task', {
        url: '/print/task/:taskId',
        params: {
          taskId: NST_DEFAULT.STATE_PARAM,
          model : null,
          trusted: false
        },
        options: {
          group: 'print'
        },
        templateUrl: 'app/messages/print/print-task.html',
        controller: 'PrintTaskController',
        controllerAs: 'ctlTask'
      })
      .state('app.messages-bookmarked', {
        url: '/bookmarks',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'bookmarked',
          feed: true,
          alias: 'savescroll'
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
          favoritePlace : true,
          alias: 'savescroll'
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
          feed: true,
          alias: 'savescroll'
        }
      })
      .state('app.messages-sent', {
        url: '/shared',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          primary: true,
          group: 'sent',
          alias: 'savescroll'
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
          group: 'posts',
          alias: 'savescroll'
        }
      })
      .state('app.place-messages-unread', {
        url: '/places/:placeId/unread',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctrl',
        options: {
          group: 'message',
          alias: 'savescroll'
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
          group: 'message',
          alias: 'savescroll'
        }
      });

  }

})();
