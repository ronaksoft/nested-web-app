(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('conversationController', conversationController);

  /** @ngInject */
  function conversationController($log, $stateParams, $state,
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
    vm.searchOnEnterKeyPressed = searchOnEnterKeyPressed;
    vm.backToConversation = backToConversation;

    (function () {
      NstSvcUserFactory.get($stateParams.userId)
        .then(function (user) {
          vm.account = user;
          var query = getUriQuery();
          vm.queryString = query.toString();
          var searchObj = new NstSearchQuery(vm.queryString);
          vm.refererPlaceId = searchObj.getDefaultPlaceId();
          searchMessages(vm.queryString);
        });
    })();

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    function searchOnEnterKeyPressed(e, queryString) {

      var element = angular.element(event.target);
      if (!queryString || !sendKeyIsPressed(event) || element.attr("mention") === "true") {
        return;
      }
      // if (!sendKeyIsPressed(e) || !queryString) {
      //   return;
      // }

      search(queryString);
    }

    function search(queryString) {
      vm.messages.length = 0;
      var query = new NstSearchQuery(queryString);
      $state.go('app.conversation-keyword', { userId: $stateParams.userId, keywords : NstSearchQuery.encode(queryString) }).then(function (newState) {
        skip = 0;
        searchMessages(query.toString());
      });
    }

    function getUriQuery() {
      return $stateParams.keywords || '';
    }

    function searchMessages(queryString) {
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;

      NstSvcPostFactory.conversation(vm.account.id, queryString, limit, skip).then(function (posts) {

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

    $(window).scroll(function (event) {
      var element = event.currentTarget;
      if (element.pageYOffset + element.innerHeight === $('body').height()) {
        $log.debug("load more");
        vm.loadMore();
      }
    });
  }

})();
