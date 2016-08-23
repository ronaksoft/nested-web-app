(function () {
  'use strict';

  angular
    .module('nested')
    .controller('SearchController', SearchController);

  /** @ngInject */
  function SearchController($log, $stateParams, $state,
    NstSvcPostFactory, NstSvcPostMap, NstSvcServer, NstSvcAuth,
    NstSearchQuery) {
    var vm = this;

    vm.search = search;
    vm.viewSetting = {
      content: true,
      attachments: true,
      comments: false,
    };

    (function () {

      var query = getUriQuery();
      vm.queryString = query.toString();
      searchMessages(vm.queryString);
    })();

    function search(queryString) {
      var query = new NstSearchQuery(queryString);
      $state.go('search', { query : NstSearchQuery.encode(queryString) } , { notify : false }).then(function (newState) {
        searchMessages(query.toString());
      });
    }

    function getUriQuery() {
      return new NstSearchQuery(_.trimStart($stateParams.query, '_'));
    }

    function searchMessages(queryString) {
      NstSvcPostFactory.search(queryString).then(function (posts) {
        vm.messages = _.map(posts, NstSvcPostMap.toSearchMessageItem);
      }).catch(function (error) {
        $log.debug(error);
      });
    }
  }

})();
