(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($q, $scope, $rootScope, $stateParams, $state, $uibModalInstance, $timeout,
                          _, toastr, moment,
                          NST_POST_EVENT, NST_COMMENT_SEND_STATUS, NST_SRV_EVENT,NST_EVENT_ACTION,
                          NstSvcAuth, NstSvcLoader, NstSvcPostFactory, NstSvcCommentFactory, NstSvcPostMap, NstSvcCommentMap, NstSvcPlaceFactory, NstUtility, NstSvcLogger, NstSvcServer, NstSvcPostInteraction, NstSvcTranslation,
                          NstSvcSync,
                          NstTinyComment, NstVmUser, selectedPostId) {
    var vm = this;
    var defaultLimit = 8;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.hasRemoveAccess = null;
    vm.placesWithRemoveAccess = [];
    vm.post = null;
    vm.postId = selectedPostId || $stateParams.postId;

    vm.urls = {
      reply_all: $state.href('app.compose-reply-all', {postId: vm.postId}),
      reply_sender: $state.href('app.compose-reply-sender', {postId: vm.postId}),
      forward: $state.href('app.compose-forward', {postId: vm.postId})
    };

    vm.loadProgress = false;

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.loadMore = loadMore;

    (function () {

      load(vm.postId).then(function (done) {
        // TODO: uncomment and fix
        // vm.syncId = NstSvcSync.openChannel(_.head(vm.post.allPlaces).id);

        return vm.post.isRead ? $q.resolve(true) : markPostAsRead(vm.postId);
      }).then(function (result) {
        NstSvcPostFactory.dispatchEvent(new CustomEvent(NST_POST_EVENT.VIEWED, {
          detail: {
            postId: vm.post.id,
            comments: vm.comments
          }
        }));
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });

      // listens to post-robbons to switch them to post-card mode
      $scope.$on('post-chain-expand-me', function (event, data) {
        if (data.postId) {
          vm.extendedId = data.postId;
        }
      });

    })();

    function mapMessage(post) {
      var firstId = vm.placeId ? vm.placeId : NstSvcAuth.user.id;
      return NstSvcPostMap.toMessage(post, firstId, vm.myPlaceIds);
    }

    function loadChainMessages(postId, limit) {
      var max = limit + 1;
      vm.loadProgress = true;
      return $q(function (resolve, reject) {
        NstSvcPostFactory.getChainMessages(postId, max).then(function(messages) {
          vm.hasOlder = _.size(messages) >= limit;
          var items = _.chain(messages).take(limit).sortBy('date').map(function (message) {
            return mapMessage(message);
          }).value();
          resolve(items);
        }).catch(reject).finally(function () {
            vm.loadProgress = false;
        });
      });
    }

    function load() {
      return $q(function (resolve, reject) {
        loadChainMessages(vm.postId, defaultLimit).then(function (messages) {
          vm.messages = messages;
          vm.post = _.last(vm.messages);
          vm.placesWithRemoveAccess = NstSvcPlaceFactory.filterPlacesByRemovePostAccess(vm.post.places);
          vm.hasRemoveAccess = _.isArray(vm.placesWithRemoveAccess) && vm.placesWithRemoveAccess.length > 0;

          resolve(true);
        }).catch(reject);
      });
    }

    function loadMore() {
      var oldest = _.head(vm.messages);

      if (!oldest) {
        throw Error('Could not find the oldest message of chain');
      }

      loadChainMessages(oldest.id, defaultLimit).then(function (messages) {
        NstUtility.collection.dropById(messages, oldest.id);
        vm.messages.unshift.apply(vm.messages, messages);
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('Sorry, An error has occured while loading the older posts'));
      });
    }

    function markPostAsRead(id) {
      vm.status.markAsReadProgress = true;
      NstSvcPostInteraction.markAsRead(id).then(function () {
        vm.status.postIsRed = true;
      }).catch(function () {
        vm.status.postIsRed = false;
      }).finally(function () {
        vm.status.markAsReadProgress = false;
      });
    }

    $uibModalInstance.result.finally(function () {
      // TODO: decide what to do for this
      $rootScope.$broadcast('post-modal-closed', {
        postId: vm.post.id,
        comments: _.takeRight(vm.post.comments, 3),
        totalCommentsCount: vm.post.counters.comments,
        removedCommentsCount: removedCommentsCount
      });
    });

    $scope.$on('$destroy', function () {
      // $timeout.cancel(revealNewCommentsTimeout);
      // NstSvcSync.closeChannel(vm.syncId);
    });

  }
})();
