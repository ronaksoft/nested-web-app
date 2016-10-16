(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .controller('MentionsController', MentionsController);

  function MentionsController($q, $stateParams, $log, NstSvcMentionFactory, NstVmMention, NstSvcAuth) {
    var vm = this;
    var pageItemsCount = 12;
    vm.mentions = [];
    vm.controls = {
      left: [],
      right: []
    };

    vm.markAllSeen = markAllSeen;
    vm.loadMore = loadMore;

    (function() {
      loadMentions(0, pageItemsCount);
    })();

    function markAllSeen() {
      var deferred = $q.defer();

      NstSvcMentionFactory.markAsSeen().then(function () {
        markAllItemsAsSeen(vm.mentions);
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function markAllItemsAsSeen(items) {
      _.forEach(items, function (item) {
        item.seen = true;
      });
    }

    function loadMentions(skip, limit) {
      var deferred = $q.defer();

      NstSvcMentionFactory.getMentions(skip, limit).then(function(mentions) {
        vm.mentions = _.concat(vm.mentions, _.map(mentions, mapMention));
        deferred.resolve(vm.mentions);
      }).catch(function(error) {
        $log.error(error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function mapMention(mention) {
      return new NstVmMention(mention, NstSvcAuth.user.id);
    }

    function loadMore() {
      var skip = vm.mentions.length;
      return loadMentions(skip, pageItemsCount);
    }
  }

})();
