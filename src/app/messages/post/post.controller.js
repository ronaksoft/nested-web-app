(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($q, $scope, $rootScope, $stateParams, $uibModalInstance, $interval, SvcRecorder,
                          _, toastr, NstSvcPostFactory, NstUtility, NstSvcLogger, NstSvcPostInteraction, NstSvcTranslation, NstSvcSync,
                          selectedPostId) {
    SvcRecorder.stop(true);
    var vm = this;
    var defaultLimit = 8;
    var eventReferences = [];

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.chainStack = [];
    vm.postId = selectedPostId || $stateParams.postId;
    vm.loadProgress = false;

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.loadMore = loadMore;
    vm.backToChain = backToChain;
    (function () {
      $('html').addClass("_oh");
      markPostAsRead(vm.postId);
      vm.expandProgress = true;
      load(vm.postId).then(function (posts) {
        vm.expandProgress = false;
        if (_.size(posts) === 0) return;

        vm.syncId = NstSvcSync.openChannel(vm.postId);
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });

      // listens to post-robbons to switch them to post-card mode
      eventReferences.push($scope.$on('post-chain-expand-me', function (event, data) {
        if (data.postId) {
          vm.extendedId = data.postId;
        }
      }));
      $scope.affixObserver = 0;
      eventReferences.push($scope.$on('post-view-target-changed', function (event, data) {
        vm.postId = data.postId;

        var indexOfPost = _.findIndex(vm.messages, function (msg) {
          return msg.id === vm.postId;
        });
        vm.messages.forEach(function(i,index) {
          if (index > indexOfPost) {
            i.hide = true;
          }
        })
        // vm.messages.splice(indexOfPost + 1);
        if(indexOfPost > -1) {
          vm.messages[indexOfPost].hide = false;
          vm.extendedId = data.postId;
          pushToChainStack(data.postId);
        } else {
          load(data.postId);
        }
        $scope.affixObserver++;
      }));
    })();
    function loadChainMessages(postId, limit, cacheHandler) {
      var max = limit + 1;
      vm.loadProgressId = true;
      return $q(function (resolve, reject) {
        NstSvcPostFactory.getChainMessages(postId, max, function(cachedPosts) {
          if (_.size(cachedPosts) > 0 && _.isFunction(cacheHandler)) {
            cacheHandler(_.chain(cachedPosts).take(limit).sortBy('timestamp').value());
          }
        }).then(function (messages) {
          if (_.isEmpty(messages)) {
            reject();
            return;
          }
          vm.hasOlder = _.size(messages) >= limit;
          var items = _.chain(messages).take(limit).sortBy('timestamp').value();
          resolve(items);
        }).catch(reject).finally(function () {
          vm.loadProgress = false;
        });
      });
    }

    function backToChain() {
      load(vm.chainStack[vm.chainStack.length - 2]);
      vm.chainStack.splice(vm.chainStack.length - 2, 2);
    }

    function pushToChainStack(id) {
      if (!_.includes(vm.chainStack, id)) {
        vm.chainStack.push(id);
      }
    }

    function load(postId) {
      vm.expandProgressId = postId;
      return loadChainMessages(postId, defaultLimit, function(cachedPosts) {
        vm.expandProgressId = null;
        vm.extendedId = postId;
        vm.postId = postId;
        pushToChainStack(postId);
        vm.messages = cachedPosts;
      }).then(function (posts) {
        vm.expandProgressId = null;
        vm.extendedId = postId;
        vm.postId = postId;
        pushToChainStack(postId);
        vm.messages = posts;
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error occured while tying to show the post full body.'));
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
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Sorry, An error has occured while loading the older posts'));
      });
    }

    function markPostAsRead(id) {
      vm.markAsReadProgress = true;
      NstSvcPostInteraction.markAsRead(id).then(function () {
        var targetPost = _.find(vm.messages, { id: id });
        if (targetPost) {
          targetPost.read = true;
        }
      }).finally(function () {
        vm.markAsReadProgress = false;
      });
    }

    $uibModalInstance.result.finally(function () {
      var targetPost = _.last(vm.messages);
      if (!targetPost) return;

      eventReferences.push($rootScope.$broadcast('post-modal-closed', {
        postId: vm.postId,
        comments: _.takeRight(targetPost.comments, 3)
      }));
    });

    $scope.$on('$destroy', function () {
      $('html').removeClass("_oh");
      NstSvcSync.closeChannel(vm.syncId);
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
      // Object.keys(window.affixerListenersPostView).forEach(function(k) {
      //   $('.modal')[0].removeEventListener('scroll', window.affixerListenersPostView[k]);
      // });
      window.affixerListenersPostView = {};
    });
  }

})();
