(function () {
  'use strict';

  angular
    .module('nested')
    .controller('SearchController', SearchController);

  /** @ngInject */
  function SearchController($log,
    NstSvcPostFactory, NstSvcPostMap, NstSvcServer, NstSvcAuth,
    NstSearchQuery) {
    var vm = this;

    vm.search = search;

    function search(query) {

      NstSvcAuth.logout();

      // NstSvcPostFactory.search(new NstSearchQuery(query)).then(function (posts) {
      //   vm.messages = _.map(posts, NstSvcPostMap.toSearchMessageItem);
      // }).catch(function (error) {
      //   $log.debug(error);
      // });
    }
  }

})();
