(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('SearchController', SearchController);

  /** @ngInject */
  function SearchController($rootScope, $log, $stateParams, $state,
                            NST_DEFAULT, NstSvcPostFactory, NstSvcServer, NstSvcAuth,
                            NstSearchQuery, NstVmFile, $window) {
    var vm = this;
    var limit = 8;
    var skip = 0;

    vm.newMethod = false;
    vm.searchParams = [];
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
      vm.queryString = query.toString(false);
      vm.refererPlaceId = query.getDefaultPlaceId();
      vm.newMethod = query.isNewMethod();
      vm.searchParams = query.getSearchParams();
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
      var newMethod = (element.attr('mention-new-method') !== undefined);
      search(queryString, newMethod);
    }

    function search(queryString, isNewMethod) {
      vm.messages.length = 0;
      var query = new NstSearchQuery(queryString, isNewMethod);
      vm.newMethod = query.isNewMethod();
      vm.searchParams = query.getSearchParams();
      $state.go('app.search', { search : NstSearchQuery.encode(query.toString()) }).then(function (newState) {
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

      if (vm.newMethod) {
        // new search method should implemented here
      } else {
        NstSvcPostFactory.search(queryString, limit, skip).then(function (posts) {

          _.forEach(posts, function (message) {
            if (!_.some(vm.messages, {id: message.id})) {
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
    }

    function loadMore() {
      if (vm.reachedTheEnd) {
        return;
      }

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

    // $(window).scroll(function (e) {
    //   var element = e.currentTarget;
    //   if (element.pageYOffset + element.innerHeight === $('body').height()) {
    //     $log.debug("load more");
    //     vm.loadMore();
    //   }
    // });
  }

})();
