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
        post: {}
      },
      templateUrl: 'app/messages/post/post.html',
      controller: 'PostController',
      controllerAs: 'ctlPost'
    })
    .state('app.place-message', {
      url: '/place/:placeId/message/:postId',
      params: {
        postId: NST_DEFAULT.STATE_PARAM,
        post: {}
      },
      templateUrl: 'app/messages/post/post.html',
      controller: 'PostController',
      controllerAs: 'ctlPost'
    })
    .state('app.message-chain', {
      url: '/message/:postId/chain',
      params: {
        postId: NST_DEFAULT.STATE_PARAM,
      },
      templateUrl: 'app/messages/chain/message-chain.html',
      controller: 'MessageChainController',
      controllerAs: 'ctlChain'
    })
    .state('app.place-message-chain', {
      url: '/place/:placeId/message/:postId/chain',
      params: {
        postId: NST_DEFAULT.STATE_PARAM,
      },
      templateUrl: 'app/messages/chain/message-chain.html',
      controller: 'MessageChainController',
      controllerAs: 'ctlChain'
    }).state('app.messages', {
      url: '/messages',
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.messages-bookmarks', {
      url: '/messages/bookmarks',
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.messages-bookmarks-sorted', {
      url: '/messages/bookmarks/:sort',
      params: {
        sort: NST_DEFAULT.STATE_PARAM
      },
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.messages-sent', {
      url: '/messages/sent',
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.messages-sent-sorted', {
      url: '/messages/sent/:sort',
      params: {
        sort: NST_DEFAULT.STATE_PARAM
      },
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.messages-sorted', {
      url: '/messages/:sort',
      params: {
        sort: NST_DEFAULT.STATE_PARAM
      },
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.place-messages', {
      url: '/places/:placeId/messages',
      params: {
        placeId: NST_DEFAULT.STATE_PARAM
      },
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    })
    .state('app.place-messages-sorted', {
      url: '/places/:placeId/messages/:sort',
      params: {
        placeId: NST_DEFAULT.STATE_PARAM,
        sort: NST_DEFAULT.STATE_PARAM
      },
      templateUrl: 'app/messages/messages.html',
      controller: 'MessagesController',
      controllerAs: 'ctlMessages'
    });

  }

})();
