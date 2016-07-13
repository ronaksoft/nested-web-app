(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($location, $scope, $stateParams, $uibModal, $q, $log, $timeout, _, toastr,
    NstSvcAuth, NstSvcServer, LoaderService, PostFactoryService, EVENT_ACTIONS, WS_EVENTS,
    NstPost, NstComment, postId) {
    var vm = this;

    if (!NstSvcAuth.isInAuthorization()) {
      $location.search({
        back: $location.path()
      });
      $location.path('/signin').replace();
    }

    vm.postLoadProgress = false;
    vm.commentSendProgress = false;
    vm.commentRemoveProgress = false;
    vm.commentLoadProgress = false;
    vm.hasMoreComments = false;

    vm.user = NstSvcAuth.user;
    vm.commentSettings = {
      skip: 0,
      limit: 30,
    };

    vm.removeComment = removeComment;
    vm.haseRemoveAccess = haseRemoveAccess;
    vm.removePost = removePost;
    vm.sendComment = sendComment;
    vm.loadMoreComments = loadMoreComments;
    vm.allowToRemoveComment = allowToRemoveComment;

    vm.postId = $stateParams.postId || postId;

    (function () {
      vm.postLoadProgress = true;
      PostFactoryService.getWithComments(vm.postId, vm.commentSettings).then(function (post) {
        vm.post = post;
        vm.postLoadProgress = false;
        // the conditions says maybe there are more comments that the limit
        vm.hasMoreComments = !(vm.commentSettings.skip < vm.commentSettings.limit);
        $scope.scrolling = true;

      }).catch(function (error) {
        // TODO: create a service that handles errors
        // and knows what to do when an error occurs
      });
    })();

    $scope.unscrolled = true;
    vm.checkScroll = function(event) {
      var element = event.target;

      $scope.unscrolled = element.scrollTop === (element.scrollHeight - element.offsetHeight);
    };


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
     * @param  {Event} event event handler
     * @return {string}       refined comment
     */
    function extractCommentBody(event) {
      return event.currentTarget.value.trim();
    }

    function allowToRemoveComment(comment) {
      return comment.sender.username === vm.user.username
        && (Date.now() - comment.date < 20 * 60 * 1e3);
    }


    /**
     * sendComment - add the comment to the list of the post comments
     *
     * @param  {Event} event keypress event handler
     */
    function sendComment(event) {
      if (!sendKeyIsPressed(event)) {
        return;
      }

      var body = extractCommentBody(event);
      if (body.length === 0) {
        return;
      }

      $scope.commentSendInProgress = true;

      PostFactoryService.addComment(vm.post, vm.user, body).then(function(post) {
        vm.post = post;
        event.currentTarget.value = '';
        $scope.scrolling = $scope.unscrolled && true;
        $scope.commentSendInProgress = false;
        // TODO: notify
      }).catch(function(error) {
        // TODO: decide
      });

      return false;
    };

    function loadMoreComments() {
      vm.commentLoadProgress = true;
      PostFactoryService.retrieveComments(vm.post, vm.commentSettings).then(function (post) {
        vm.post = post;
        vm.commentLoadProgress = false;
        vm.scrolling = true;
      }).catch(function (error) {
        // TODO: create a service that handles errors
        // and knows what to do when an error occurs
      });
    }


    NstSvcServer.addEventListener(WS_EVENTS.TIMELINE, function(tlEvent) {
      switch (tlEvent.detail.timeline_data.action) {
        case EVENT_ACTIONS.COMMENT_ADD:
        case EVENT_ACTIONS.COMMENT_REMOVE:

          if ($scope.thePost.id == tlEvent.detail.timeline_data.post_id.$oid) {
            var commentId = tlEvent.detail.timeline_data.comment_id.$oid;

            LoaderService.inject((new NstComment($scope.thePost)).load(commentId).then(function(comment) {
              $scope.thePost.addComment(comment).then(function() {
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
      PostFactoryService.removeComment(vm.post, comment).then(function(comment) {
        vm.commentRemoveProgress = false;
        //notify
      }).catch(function(error) {
        //decide
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
            PostFactoryService.remove(post.id, place.id).then(function(res) {
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
