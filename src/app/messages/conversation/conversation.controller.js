(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('conversationController', conversationController);

  /** @ngInject */
  function conversationController(_, $log, $stateParams, $state, $scope,
                            NST_DEFAULT, NstSvcPostFactory, NstSvcUserFactory, NstSvcPostMap, NstSvcServer, NstSvcAuth,
                            NstSearchQuery) {
    var vm = this;
    var limit = 8;
    var skip = 0;

    vm.reachedTheEnd = false;
    vm.loading = false;
    vm.loadMessageError = false;
    vm.noResult = false;
    vm.messages = [];
    vm.viewSetting = {
      content: true,
      attachments: true,
      comments: false,
    };
    vm.searchOnEnterKeyPressed = searchOnEnterKeyPressed;


    vm.suggestedItems = [{
      type : 'user',
      name : 'Foo',
      id : 'foo'
    },
    {
      type : 'account',
      name : 'Bar',
      id : 'bar'
    }];

    vm.search = search;
    vm.loadMore = loadMore;
    vm.backToConversation = backToConversation;

    (function () {
      NstSvcUserFactory.get($stateParams.userId)
        .then(function (user) {

          vm.account = user;
          searchLazily();
        });
    })();

    function sendKeyIsPressed(e) {
      return 13 === e.keyCode && !(e.shiftKey || e.ctrlKey);
    }


    function searchOnEnterKeyPressed(e, queryString) {
      var element = angular.element(e.target);
      if (!sendKeyIsPressed(e) || element.attr("mention") === "true") {
        return;
      }
      vm.messages = [] ;
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;
      searchLazily(queryString);
    }


    function search(queryString) {
      searchMessages(queryString);
    }

    var searchLazily = _.debounce(search, 640);

    function searchMessages(queryString) {
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;

      NstSvcPostFactory.conversation($stateParams.userId, queryString, limit, skip).then(function (posts) {

        var olderMessages = _.map(posts, NstSvcPostMap.toSearchMessageItem);
        _.forEach(olderMessages, function (message) {
          if (!_.some(vm.messages, { id : message.id })){
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
      $state.go('app.conversation', { userId : vm.account.id});
    }

    $(window).scroll(function (e) {
      var element = e.currentTarget;
      if (element.pageYOffset + element.innerHeight === $('body').height()) {
        $log.debug("load more");
        vm.loadMore();
      }
    });
  }

})();
