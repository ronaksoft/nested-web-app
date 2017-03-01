(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('SearchController', SearchController);

  /** @ngInject */
  function SearchController($rootScope, $log, $stateParams, $state,
                            NST_DEFAULT, NstSvcPostFactory, NstSvcPostMap, NstSvcServer, NstSvcAuth,
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


    vm.search = search;
    vm.loadMore = loadMore;
    vm.searchOnEnterKeyPressed = searchOnEnterKeyPressed;
    vm.backToPlace = backToPlace;

    (function () {

      var query = getUriQuery();
      vm.queryString = query.toString();
      var searchObj = new NstSearchQuery(vm.queryString);
      vm.refererPlaceId = searchObj.getDefaultPlaceId();
      searchMessages(vm.queryString);
    })();

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(e) {
      return 13 === e.keyCode && !(e.shiftKey || e.ctrlKey);
    }

    function searchOnEnterKeyPressed(e, queryString) {

      var element = angular.element(e.target);
      if (!queryString || !sendKeyIsPressed(e) || element.attr("mention") === "true") {
        return;
      }

      search(queryString);
    }

    function search(queryString) {
      vm.messages.length = 0;
      var query = new NstSearchQuery(queryString);
      $state.go('app.search', { search : NstSearchQuery.encode(queryString) }).then(function (newState) {
        skip = 0;
        searchMessages(query.toString());
      });
    }

    function getUriQuery() {
      return new NstSearchQuery(_.trimStart($stateParams.search, '_'));
    }

    function searchMessages(queryString) {
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;

      NstSvcPostFactory.search(queryString, limit, skip).then(function (posts) {

        var olderMessages = _.map(posts, NstSvcPostMap.toSearchMessageItem);
        _.forEach(olderMessages, function (message) {
          if (!_.some(vm.messages, { id : message.id })){
            vm.messages.push(message);
          }
        });

        vm.noResult = vm.messages.length === 0;
        // vm.reachedTheEnd = olderMessages.length > 0 && olderMessages.length < limit;
        vm.reachedTheEnd = olderMessages.length == 0 && !(vm.messages.length === 0);

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

    function backToPlace() {
      if (vm.refererPlaceId){
        $state.go('app.place-messages', { placeId : vm.refererPlaceId});
      } else {
        $state.go(NST_DEFAULT.STATE);
      }
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
