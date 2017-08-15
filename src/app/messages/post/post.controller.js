(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($q, $scope, $rootScope, $stateParams, $uibModalInstance,
                          _, toastr, NstSvcPostFactory, NstUtility, NstSvcLogger, NstSvcPostInteraction, NstSvcTranslation, NstSvcSync,
                          selectedPostId) {
    var vm = this;
    var defaultLimit = 8;
    var eventReferences = [];


    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.chainStack = [];
    vm.post = null;
    vm.postId = selectedPostId || $stateParams.postId;
    vm.loadProgress = false;

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.loadMore = loadMore;
    vm.backToChain = backToChain;

    (function () {
      vm.expandProgress = true;
      load(vm.postId).then(function () {
        vm.expandProgress = false;
        // TODO: uncomment and fix
        vm.syncId = NstSvcSync.openChannel(_.head(vm.post.places).id);

        return vm.post.read ? $q.resolve(true) : markPostAsRead(vm.postId);
      }).then(function () {
        $rootScope.$broadcast('post-viewed', { postId: vm.post.id });
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });

      // listens to post-robbons to switch them to post-card mode
      eventReferences.push($scope.$on('post-chain-expand-me', function (event, data) {
        if (data.postId) {
          vm.extendedId = data.postId;
        }
      }));

      eventReferences.push($scope.$on('post-view-target-changed', function (event, data) {
        vm.postId = data.postId;

        var indexOfPost = _.findIndex(vm.messages, function (msg) {
          return msg.id === vm.postId;
        });

        vm.messages.splice(indexOfPost + 1);

        load(data.postId);
      }));
    })();

    function loadChainMessages(postId, limit) {
      var max = limit + 1;
      vm.loadProgressId = true;
      return $q(function (resolve, reject) {
        NstSvcPostFactory.getChainMessages(postId, max).then(function (messages) {
          vm.hasOlder = _.size(messages) >= limit;
          var items = _.chain(messages).take(limit).sortBy('timestamp').map(function (message) {
            message.attachments = message.attachments;
            return message;
          }).value();
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
      if (!_.includes(vm.chainStack, id))
        vm.chainStack.push(id);

    }

    function load(postId) {
      vm.expandProgressId = postId;
      return $q.all([loadChainMessages(postId, defaultLimit), NstSvcPostFactory.get(postId)]).then(function (resolvedSet) {
        vm.expandProgressId = null;
        vm.extendedId = postId;
        vm.postId = postId;
        pushToChainStack(postId);
        vm.messages = resolvedSet[0];
        vm.post = _.last(resolvedSet[0]);

        vm.post.body = resolvedSet[1].body;
        vm.post.trusted = Object.keys(resolvedSet[1].resources).length > 0 ? $stateParams.trusted : true;
        vm.post.resources = resolvedSet[1].resources;

        vm.messages.splice(vm.messages.length - 1, 1, vm.post);
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
        vm.post.read = true;
      }).catch(function () {
        vm.post.read = false;
      }).finally(function () {
        vm.markAsReadProgress = false;
      });
    }

    $uibModalInstance.result.finally(function () {
      eventReferences.push($rootScope.$broadcast('post-modal-closed', {
        postId: vm.post.id,
        comments: _.takeRight(vm.post.comments, 3)
      }));
    });

    $scope.$on('$destroy', function () {
      NstSvcSync.closeChannel(vm.syncId);
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
  }

})();
