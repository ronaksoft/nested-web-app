(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($q, $scope, $rootScope, $stateParams, $state, $uibModalInstance,
                          _, toastr,
                          NST_POST_EVENT,
                          NstSvcAuth, NstSvcPostFactory, NstSvcPostMap, NstSvcPlaceFactory, NstUtility, NstSvcLogger,NstSvcPostInteraction, NstSvcTranslation, NstSvcSync,
                          selectedPostId) {
    var vm = this;
    var defaultLimit = 8;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.hasRemoveAccess = null;
    vm.placesWithRemoveAccess = [];
    vm.post = null;
    vm.postId = selectedPostId || $stateParams.postId;
    vm.loadProgress = false;

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.loadMore = loadMore;

    (function () {
      load(vm.postId).then(function (done) {
        // TODO: uncomment and fix
        vm.syncId = NstSvcSync.openChannel(_.head(vm.post.allPlaces).id);

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

      $scope.$on('post-view-target-changed', function (event, data) {
        vm.postId = data.postId;
        load(data.postId);
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

    function load(postId) {
      return $q(function (resolve, reject) {
        loadChainMessages(postId, defaultLimit).then(function (messages) {
          vm.messages = messages;
          vm.post = _.last(vm.messages);

          vm.placesWithRemoveAccess = NstSvcPlaceFactory.filterPlacesByRemovePostAccess(vm.post.places);
          vm.hasRemoveAccess = _.isArray(vm.placesWithRemoveAccess) && vm.placesWithRemoveAccess.length > 0;

          // TODO: Optimize (get accessses instead of a place object which has more cost)
          checkHasManagerAccess(_.map(vm.post.allPlaces, 'id'));

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
      vm.markAsReadProgress = true;
      NstSvcPostInteraction.markAsRead(id).then(function () {
        vm.post.isRead = true;
      }).catch(function () {
        vm.post.isRead = false;
      }).finally(function () {
        vm.markAsReadProgress = false;
      });
    }

    $uibModalInstance.result.finally(function () {
      $rootScope.$broadcast('post-modal-closed', {
        postId: vm.post.id,
        comments: _.takeRight(vm.post.comments, 3),
        totalCommentsCount: vm.post.commentsCount,
        // removedCommentsCount: removedCommentsCount
      });
    });

    $scope.$on('$destroy', function () {
      NstSvcSync.closeChannel(vm.syncId);
    });

    function checkHasManagerAccess(placeIds) {
      $q.all(_.map(placeIds, function (placeId) {
        return NstSvcPlaceFactory.get(placeId);
      })).then(function (places) {
        var placesWithControlAccess = NstSvcPlaceFactory.filterPlacesByControlAccess(places);
        vm.hasPlaceWithControlAccess = _.size(placesWithControlAccess) > 0;
      });
    }

  }
})();
