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
    var removedCommentsCount = 0;
    var revealNewCommentsTimeout = null;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.user = new NstVmUser(NstSvcAuth.getUser());
    vm.revealNewComment = false;
    vm.comments = [];
    vm.commentSettings = {
      date: Date.now(),
      limit: 10
    };
    vm.hasMoreComments = null;
    vm.hasRemoveAccess = null;
    vm.placesWithRemoveAccess = [];
    vm.post = null;
    vm.postId = selectedPostId || $stateParams.postId;

    vm.status = {
      postLoadProgress: null,
      commentRemoveProgress: null,
      commentLoadProgress: null,
      markAsReadProgress: null,
      postIsRed: null,
      ready: null
    };
    vm.urls = {
      reply_all: $state.href('app.compose-reply-all', {postId: vm.postId}),
      reply_sender: $state.href('app.compose-reply-sender', {postId: vm.postId}),
      forward: $state.href('app.compose-forward', {postId: vm.postId})
    };

    vm.extendedId = null;


    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.sendComment = sendComment;
    vm.removeComment = removeComment;
    vm.loadMoreComments = loadMoreComments;
    vm.allowToRemoveComment = allowToRemoveComment;
    vm.removePost = removePost;
    vm.retractPost = retractPost;
    vm.resend = resend;
    vm.forward = forward;
    vm.replyAll = replyAll;
    vm.replySender = replySender;

    (function () {

      loadChainMessages(vm.postId).then(function (done) {
        // TODO: uncomment and fix
        // vm.syncId = NstSvcSync.openChannel(_.head(vm.post.allPlaces).id);

        return loadComments(vm.postId, vm.commentSettings);
      }).then(function (result) {

        vm.comments = mapComments(result.comments);
        vm.hasMoreComments = vm.hasMoreComments || result.maybeMoreComments;

        revealNewCommentsTimeout = $timeout(function () {
          vm.revealNewComment = true;
        }, 0)

        return isPostRead(vm.post) ? $q.resolve(true) : markPostAsRead(vm.postId);
      }).then(function (result) {
        vm.status.ready = true;

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

    function loadChainMessages(postId) {
      return $q(function (resolve, reject) {
        NstSvcPostFactory.getChainMessages(postId).then(function(messages) {
          vm.messages = _.map(messages, function (message) {
            return mapMessage(message);
          });

          // the last post (which is the target) should always be extended
          vm.post = _.head(_.takeRight(vm.messages));
          vm.extendedId = vm.post.id;

          vm.placesWithRemoveAccess = NstSvcPlaceFactory.filterPlacesByRemovePostAccess(vm.post.places);
          vm.hasRemoveAccess = _.isArray(vm.placesWithRemoveAccess) && vm.placesWithRemoveAccess.length > 0;
          vm.hasMoreComments = vm.post.commentsCount > vm.commentSettings.limit;
          resolve(true);
        }).catch(reject);
      });
    }

    /**
     * sendComment - add the comment to the list of the post comments
     *
     * @param  {Event}  event   keypress event handler
     */
    function sendComment(event) {
      event.preventDefault();
      //var cm = event.currentTarget.innerText;
      var cm = event.currentTarget.value;

      var element = angular.element(event.target);
      if (!sendKeyIsPressed(event) || element.attr("mention") === "true") {
        return;
      }

      var body = extractCommentBody(cm);
      if (0 == body.length) {
        return;
      }

      var temp = mapComment(createCommentModel(body));
      temp.status = NST_COMMENT_SEND_STATUS.PROGRESS;
      temp.isTemp = true;

      pushComment(temp);
      vm.revealNewComment = true;


      vm.nextComment = "";
      addComment(vm.post.id, body).then(function (comment) {
        // TODO: notify
        markCommentSent(temp.id, comment);
        vm.revealNewComment = true;
      }).catch(function (error) {
        markCommentFailed(temp.id);
        // TODO: decide && show toastr
      });

      return false;
    }

    function createCommentModel(body) {
      return new NstTinyComment({
        id: _.uniqueId('temp_'),
        body: body,
        date: moment(),
        sender: NstSvcAuth.user,
      });
    }

    function markCommentSent(tempCommentId, comment) {
      var temp = _.find(vm.comments, {id: tempCommentId});
      if (temp) {
        temp.isTemp = false;
        temp.status = NST_COMMENT_SEND_STATUS.SUCCESS;
        temp.id = comment.id;
        temp.date = comment.date;
        moveToHead(temp);
      }
    }

    function moveToHead(comment) {
      var index = _.findIndex(vm.comments, {id: comment.id});
      if (index > 0) {
        var item = vm.comments[index];
        vm.comments.splice(index, 1);
        pushComment(item);
      }
    }

    function markCommentFailed(tempCommentId) {
      var temp = _.find(vm.comments, {id: tempCommentId});
      if (temp) {
        temp.status = NST_COMMENT_SEND_STATUS.FAIL;
      }
    }

    /**
     * removeComment - remove the comment
     *
     * @param  {NstPost}     post      current post
     * @param  {NstComment}  comment   the comment
     */
    function removeComment(comment) {
      if (vm.status.commentRemoveProgress) {
        return;
      }
      reqRemoveComment(vm.postModel, comment).then(function (post) {
        NstUtility.collection.dropById(vm.comments, comment.id);
        removedCommentsCount++;
      }).catch(function (error) {
        // TODO: decide && show toastr
      });
    }


    /**
     * removePost - remove the post from the places that the user selects
     *
     * @param  {NstPost} post current post
     */
    function removePost(post) {

      NstSvcPostInteraction.remove(post, vm.placesWithRemoveAccess).then(function (place) {
        if (!place) {
          return;
        }
        NstUtility.collection.dropById(vm.placesWithRemoveAccess, place.id);
        post.dropPlace(place.id);

        NstSvcPlaceFactory.filterPlacesByReadPostAccess(post.allPlaces).then(function (placesWithReadPostAccess) {
          if (placesWithReadPostAccess.length === 0) {
            $uibModalInstance.dismiss();
          }
        });

        toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from Place {0}."), place.name));
      }).catch(function () {
        //FIXME: catch error
        // toastr.error(NstUtility.string.format("An error occured while trying to remove the message."));
      });
    }


    function retractPost(post) {
      NstSvcPostInteraction.retract(post).then(function (done) {
        if (done) {
          $uibModalInstance.dismiss();
        }
      });
    }

    function forward($event) {
      $event.preventDefault();
      $uibModalInstance.close();
      $state.go('app.compose-forward', {postId: vm.postId});
    }

    function replyAll($event) {
      $event.preventDefault();
      $uibModalInstance.close();
      $state.go('app.compose-reply-all', {postId: vm.postId});
    }

    function replySender($event) {
      $event.preventDefault();
      $uibModalInstance.close();
      $state.go('app.compose-reply-sender', {postId: vm.postId});
    }

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    $scope.unscrolled = true;
    vm.checkScroll = function (event) {
      var element = event.target;

      $scope.unscrolled = element.scrollTop === (element.scrollHeight - element.offsetHeight);
    };

    /*****************************
     *****   Request Methods  ****
     *****************************/

    function addComment(post, text) {
      var deferred = $q.defer();

      NstSvcLoader.inject(NstSvcCommentFactory.addComment(post, text)).then(function (comment) {
        deferred.resolve(comment);
      }).catch(function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function reqRemoveComment(post, comment) {
      vm.status.commentRemoveProgress = true;

      return NstSvcLoader.inject(NstSvcCommentFactory.removeComment(post, comment)).then(function (post) {
        vm.status.commentRemoveProgress = false;

        return $q(function (res) {
          res(post);
        });
      }).catch(function (error) {
        vm.status.commentRemoveProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
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

    function isPostRead(post) {
      return post.isRead;
    }

    function loadComments(postId, settings) {
      var deferred = $q.defer();
      var result = {
        comments: [],
        maybeMoreComments: null
      };
      vm.status.commentLoadProgress = true;
      NstSvcCommentFactory.retrieveComments(postId, settings).then(function (comments) {
        result.comments = comments;
        result.maybeMoreComments = (comments.length === settings.limit);

        deferred.resolve(result);
      }).catch(deferred.reject).finally(function () {
        vm.status.commentLoadProgress = false;
      });

      return deferred.promise;
    }

    function loadMoreComments() {
      vm.commentSettings.date = getDateOfOldestComment(vm.comments);
      loadComments(vm.post.id, vm.commentSettings).then(function (result) {
        var olderComments = mapComments(result.comments);
        vm.comments.unshift.apply(vm.comments, olderComments);
        vm.hasMoreComments = result.maybeMoreComments;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });
    }

    function resend(model) {
      model.status = NST_COMMENT_SEND_STATUS.PROGRESS;
      model.isTemp = true;
      addComment(vm.post, model.body).then(function (comment) {
        vm.postModel.addToCommentsCount(1);
        markCommentSent(model.id, comment);
        event.currentTarget.value = '';
        vm.revealNewComment = true;
      }).catch(function (error) {
        markCommentFailed(model.id);
        // TODO: decide && show toastr
      });
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    function mapPost(postModel) {
      return NstSvcPostMap.toPost(postModel);
    }

    function mapComment(commentModel) {
      return NstSvcCommentMap.toPostComment(commentModel);
    }

    function mapComments(commentModels) {
      return reorderComments(_.map(commentModels, mapComment));
    }

    function reorderComments(comments) {
      return _.orderBy(comments, 'date', 'asc');
    }

    /*****************************
     *****    Push Methods    ****
     *****************************/

    function pushComment(model) {
      var alreadyPushed = _.some(vm.comments, {id: model.id});

      if (!alreadyPushed) {
        vm.comments.push(model);
      }
    }

    function pushTempComment(tempComment) {
      vm.comments.push(tempComment);
    }

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    NstSvcSync.addEventListener(NST_EVENT_ACTION.COMMENT_ADD, function (event) {
      if (vm.postId == event.detail.post.id) {
        if (NstSvcAuth.user.id === event.detail.comment.sender.id && _.some(vm.comments, {body: event.detail.comment.body})) {
          return false;
        } else {
          pushComment(mapComment(event.detail.comment));
          vm.postModel.addToCommentsCount(1);
        }
      }
    });

    NstSvcSync.addEventListener(NST_EVENT_ACTION.COMMENT_REMOVE, function (event) {
      if (vm.postId == event.detail.postId) {

      }
    });

    NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
      NstSvcLogger.debug('Retrieving new comments right after reconnecting.');
      loadMoreComments();
    });

    /*****************************
     *****   Other Methods    ****
     *****************************/


    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     *
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    /**
     * extractCommentBody - extract and refine the comment
     *
     * @param  {Event}    event   event handler
     *
     * @return {string}       refined comment
     */
    function extractCommentBody(cm) {
      return cm.trim();
    }

    function findOldestComment(comments) {
      return _.first(_.orderBy(comments, 'date'));
    }

    function getDateOfOldestComment(comments) {
      var oldest = findOldestComment(comments);
      var date = null;
      if (oldest) {
        date = oldest.date;
      } else {
        date = new Date();
      }
      date.setMilliseconds(date.getMilliseconds() - 1);

      return NstUtility.date.toUnix(date);
    }

    function allowToRemoveComment(comment) {

      if (vm.hasRemoveAccess) return true;

      if (comment && comment.id && vm.user && vm.user.id) {
        var now = Date.now();
        return comment.sender.username === vm.user.id
          && ((now - comment.date) < 24 * 60 * 60 * 1e3);
      }

      return false;
    }

    $uibModalInstance.result.finally(function () {
      $rootScope.$broadcast('post-modal-closed', {
        postId: vm.post.id,
        comments: _.takeRight(vm.comments, 3),
        totalCommentsCount: vm.postModel.counters.comments,
        removedCommentsCount: removedCommentsCount
      });
    });

    $scope.$on('$destroy', function () {
      $timeout.cancel(revealNewCommentsTimeout);
      NstSvcSync.closeChannel(vm.syncId);
    });
  }
})();
