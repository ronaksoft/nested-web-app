(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .controller('MentionsController', MentionsController);

  function MentionsController($q, $state, $stateParams, $log, NstSvcMentionFactory, NstVmMention, NstSvcAuth, NstSvcLogger) {
    var vm = this;
    var pageItemsCount = 12;
    vm.mentions = [];
    vm.controls = {
      left: [],
      right: []
    };

    vm.markAllSeen = markAllSeen;
    vm.loadMore = loadMore;
    vm.viewPost = viewPost;
    vm.error = null;


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
        item.isSeen = true;
      });
    }

    function loadMentions(skip, limit) {
      var deferred = $q.defer();
      vm.error = false;
      vm.loading = true;
      NstSvcMentionFactory.getMentions(skip, limit).then(function(mentions) {
        vm.mentions = _.concat(vm.mentions, _.map(mentions, mapMention));
        if (mentions.length < limit){
          vm.reached = true;
        }
        vm.loading = false;
        deferred.resolve(vm.mentions);
      }).catch(function(error) {
        $log.error(error);
        vm.error = true;
        vm.loading = false;
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

    function viewPost(mention, $event) {
      $event.preventDefault();

      if (!mention.isSeen) {
        NstSvcMentionFactory.markAsSeen(mention.id).then(function () {
          markAllItemsAsSeen([mention]);
        }).catch(function (error) {
          NstSvcLogger.error(error);
        }).finally(function () {
          $state.go('app.message', { postId : mention.postId }, { notify : false });
        });
      } else {
        $state.go('app.message', { postId : mention.postId }, { notify : false });
      }

    }
  }

})();
