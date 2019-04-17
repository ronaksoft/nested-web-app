(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('conversationController', conversationController);

  /** @ngInject */
  function conversationController(_, $log, $stateParams, $state, $, $scope, $rootScope, NST_PLACE_EVENT_ACTION,
                                  NstSvcTaskUtility, NstSvcPostFactory, NstSvcUserFactory, NstSvcPlaceFactory,
                                  NST_PLACE_ACCESS, NstSvcSync, NstSvcAuth) {
    var vm = this;
    var limit = 8;
    var skip = 0;

    var eventReferences = [];

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    vm.reachedTheEnd = false;
    vm.loading = false;
    vm.loadMessageError = false;
    vm.noResult = false;
    vm.quickMessageAccess = true;
    vm.messages = [];
    vm.viewSetting = {
      content: true,
      attachments: true,
      comments: false
    };
    vm.searchOnEnterKeyPressed = searchOnEnterKeyPressed;

    vm.suggestedItems = [{
      type: 'user',
      name: 'Foo',
      id: 'foo'
    },
      {
        type: 'account',
        name: 'Bar',
        id: 'bar'
      }];

    vm.loadMore = loadMore;
    vm.backToConversation = backToConversation;

    (function () {
      if ($stateParams.userId.indexOf('@') > -1) {
        vm.account = {
          firstName: "",
          lastName: "",
          fullName: $stateParams.userId,
          id: $stateParams.userId,
          picture: {
            original:  '',              
            preview:  '',              
            x32:  '',              
            x64:  '',              
            x128:  '',              
          },
        };
      } else {
        NstSvcUserFactory.get($stateParams.userId)
        .then(function (user) {
          if (user) {
            vm.account = user;
          }
        });
      }
      
      NstSvcPlaceFactory.get($stateParams.userId)
        .then(function (place) {
          if (place) {
            vm.account = place;
            vm.quickMessageAccess = place.hasAccess(NST_PLACE_ACCESS.WRITE_POST);
          }
        });
      searchMessages();

      eventReferences.push($rootScope.$on(NST_PLACE_EVENT_ACTION.POST_ADD, function (e, data) {
        if (data.activity.actor.id === vm.user.id) {
          NstSvcPostFactory.get(data.activity.post.id).then(function (post) {
            if (_.some(post.places, {id: $stateParams.userId})) {
              vm.messages.unshift(post);
            }
          });
        }
      }));
    })();

    function sendKeyIsPressed(e) {
      return 13 === e.keyCode && !(e.shiftKey || e.ctrlKey);
    }

    function searchOnEnterKeyPressed(e, queryString) {
      var element = angular.element(e.target);
      if (!sendKeyIsPressed(e) || element.attr("mention") === "true") {
        return;
      }
      vm.messages = [];
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;
      searchLazily(queryString);
    }

    var searchLazily = _.debounce(searchMessages, 640);

    function searchMessages(queryString) {
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;

      NstSvcPostFactory.conversation($stateParams.userId, queryString, limit, skip).then(function (posts) {
        _.forEach(posts, function (message) {
          if (!_.some(vm.messages, {id: message.id})) {
            message.attachments = message.attachments;
            vm.messages.push(message);
          }
        });

        vm.noResult = vm.messages.length === 0;
        vm.reachedTheEnd = vm.messages.length > 0 && posts.length < limit;


        vm.loading = false;

      }).catch(function (error) {
        $log.debug(error);
        vm.loadMessageError = true;
        vm.loading = false;
      });
    }

    function loadMore() {
      skip = vm.messages.length;
      searchMessages(vm.queryString);
    }

    function backToConversation() {
      $state.go('app.conversation', {userId: vm.account.id});
    }

    eventReferences.push($scope.$on('scroll-reached-bottom', function () {
      vm.loadMore()
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
