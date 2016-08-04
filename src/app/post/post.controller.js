(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($scope, $stateParams, $uibModal, $q, $log, $state,
                          _, toastr,
                          EVENT_ACTIONS, NST_SRV_EVENT,
                          NstSvcAuth, NstSvcServer, NstSvcLoader, NstSvcPostFactory, NstSvcCommentFactory, NstSvcPostMap,
                          NstComment, NstVmUser, vmPost, postId) {
    var vm = this;
    vm.scrollConfig = {
      axis: 'x'
    };

    console.log(vmPost,postId);
    if (vmPost)  vm.post = vmPost;
    vm.postId = $stateParams.postId || postId;

    vm.postLoadProgress = false;
    vm.commentSendProgress = false;
    vm.commentRemoveProgress = false;
    vm.commentLoadProgress = false;
    vm.hasMoreComments = false;

    vm.user = new NstVmUser(NstSvcAuth.getUser());
    vm.commentSettings = {
      skip: 0,
      limit: 30
    };

    vm.removeComment = removeComment;
    vm.haseRemoveAccess = haseRemoveAccess;
    vm.removePost = removePost;
    vm.sendComment = sendComment;
    vm.loadMoreComments = loadMoreComments;
    vm.allowToRemoveComment = allowToRemoveComment;
    vm.loadPostComments = loadPostComments;

    vm.urls = {
      reply_all: $state.href('compose-reply-all', {
        postId: vm.postId
      }),
      reply_sender: $state.href('compose-reply-sender', {
        postId: vm.postId
      }),
      forward: $state.href('compose-forward', {
        postId: vm.postId
      })
    };


    (function () {
      vm.postLoadProgress = true;

      NstSvcPostFactory.get(vm.postId).then(function (post) {
        vm.postModel = post;
        vm.post = NstSvcPostMap.toMessage(post);
        loadPostComments();
      });

    })();

    $scope.unscrolled = true;
    vm.checkScroll = function(event) {
      var element = event.target;

      $scope.unscrolled = element.scrollTop === (element.scrollHeight - element.offsetHeight);
    };

    /**
     * Load comments of this post
     *
     */
    function loadPostComments() {
      NstSvcCommentFactory.retrieveComments(vm.postModel, vm.commentSettings).then(function (post) {
        vm.postModel = post;
        vm.post = NstSvcPostMap.toMessage(vm.postModel);

        vm.postLoadProgress = false;
        // the conditions says maybe there are more comments that the limit
        vm.hasMoreComments = !(vm.commentSettings.skip < vm.commentSettings.limit);
        $scope.scrolling = true;
      }).catch(function (error) {
        // TODO: create a service that handles errors
        // and knows what to do when an error occurs
      });
    }

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }


    /**
     * extractCommentBody - extract and refine the comment
     *
     * @param  {Event}    e   event handler
     * @return {string}       refined comment
     */
    function extractCommentBody(e) {
      return e.currentTarget.value.trim();
    }

    function allowToRemoveComment(comment) {
      return comment.sender.username === vm.user.username
        && (Date.now() - comment.date < 20 * 60 * 1e3);
    }


    /**
     * sendComment - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    function sendComment(e) {
      if (!sendKeyIsPressed(e)) {
        return;
      }

      var body = extractCommentBody(e);
      if (body.length === 0) {
        return;
      }

      vm.nextComment = "";

      vm.commentSendInProgress = true;

      NstSvcCommentFactory.addComment(vm.postModel, body).then(function(post) {
        vm.postModel = post;
        vm.post = NstSvcPostMap.toMessage(vm.postModel);
        e.currentTarget.value = '';
        vm.scrolling = $scope.unscrolled && true;
        vm.commentSendInProgress = false;
        // TODO: notify
      }).catch(function(error) {
        vm.nextComment = body;
        vm.commentSendInProgress = false;
        // TODO: decide && show toastr
      });

      return false;
    }

    function loadMoreComments() {
      vm.commentLoadProgress = true;
      NstSvcPostFactory.retrieveComments(vm.post, vm.commentSettings).then(function (post) {
        vm.postModel = post;
        vm.post = NstSvcPostMap.toMessage(vm.postModel);
        vm.commentLoadProgress = false;
        vm.scrolling = true;
      }).catch(function (error) {
        // TODO: create a service that handles errors
        // and knows what to do when an error occurs
      });
    }


    NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function(tlEvent) {
      switch (tlEvent.detail.timeline_data.action) {
        case EVENT_ACTIONS.COMMENT_ADD:
        case EVENT_ACTIONS.COMMENT_REMOVE:

          if (vm.post.id == tlEvent.detail.timeline_data.post_id.$oid) {
            var commentId = tlEvent.detail.timeline_data.comment_id.$oid;

            NstSvcLoader.inject((new NstComment(vm.post)).load(commentId).then(function(comment) {
              vm.post.addComment(comment).then(function() {
                $scope.scrolling = $scope.unscrolled && true;

                return $q(function(res) {
                  res();
                });
              }).catch(function() {});
            }));
          }

          break;
      }
    });


    /**
     * removeComment - remove the comment
     *
     * @param  {NstPost}     post      current post
     * @param  {NstComment}  comment   the comment
     */
    function removeComment(comment) {
      vm.commentRemoveProgress = true;
      NstSvcCommentFactory.removeComment(vm.post, comment).then(function(comment) {
        vm.commentRemoveProgress = false;
        //notify
      }).catch(function(error) {
        // TODO: decide && show toastr
      });
    }


    /**
     * haseRemoveAccess - the post has any place with delete access
     *
     * @param  {NstPost} post  current post
     * @return {type}             true if there is any place with delete access
     */
    function haseRemoveAccess(post) {
      return post.haveAnyPlaceWithDeleteAccess();
    }

    /**
     * removePost - remove the post from the places that the user selects
     *
     * @param  {NstPost} post current post
     */
    function removePost(post) {
      post.getPlacesHaveDeleteAccess(post).then(function(places) {

        if (moreThanOnePlace(places)) { //for multiple choices:
          previewPlaces(places).then(function(place) {
            performDelete(post, place);
          }).catch(function(reason) {

          });
        } else { // only one place
          performDelete(post, _.last(places));
        }

        function moreThanOnePlace(places) {
          return places.length > 1;
        }


        /**
         * previewPlaces - preview the places that have delete access and let the user to chose one
         *
         * @param  {type} places list of places to be shown
         */
        function previewPlaces(places) {

          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/places/list/place.list.modal.html',
            controller: 'placeListController',
            controllerAs: 'vm',
            keyboard: true,
            size: 'sm',
            resolve: {
              model: function() {
                return {
                  places: places
                };
              }
            }
          });

          return modal.result;
        }


        /**
         * deletePostFromPlace - confirm and delete the post from the chosen place
         *
         * @param  {NstPost}   post    current post
         * @param  {NstPlace}  place   the chosen place
         * @return {Promise}              the result of deletion
         */
        function deletePostFromPlace(post, place) {
          var defer = $q.defer();

          confirmOnDelete(post, place).then(function() {
            NstSvcPostFactory.remove(post.id, place.id).then(function(res) {
              // reload the post, update the time line and notify the user
              // FIXME: the taost message appears only for the first time!
              toastr.success('The post is removed from the place.');
              post.load(post.id).then(function(result) {
                $scope.$emit('post-removed', result);
              }).catch(function(res) {
                $log.debug('error: ', res);
              });
            }).catch(function(res) {
              if (res.err_code === 1) {
                $log.debug('You are not allowed to remove the post!');
              }
              defer.reject(res);
            });
          }).catch(function(reason) {
            $log.debug('The delete confirmation was rejected')
          });

          return defer.promise;
        }

        function performDelete(post, place) {
          deletePostFromPlace(post, place).then(function(res) {
            $log.debug(res);
          }).catch(function(error) {
            $log.debug(error);
          })
        }


        /**
         * confirmOnDelete - warn the user about removing the post from the chosen place
         *
         * @param  {NstPost}     post    current post
         * @param  {NstPlace}    place   the chosen place
         * @return {Promise}        the     result of confirmation
         */
        function confirmOnDelete(post, place) {
          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/post/post.delete.html',
            controller: 'postDeleteController',
            controllerAs: 'vm',
            size: 'sm',
            keyboard: true,
            resolve: {
              model: function() {
                return {
                  post: post,
                  place: place
                };
              }
            }
          });

          return modal.result;
        }
      }).catch(function(error) {
        $log.debug(error);
      });
    }
  }
})();
