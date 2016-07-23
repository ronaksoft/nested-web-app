(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostCardController', PostCardController);

  function PostCardController($rootScope, $scope, $state, $stateParams, $log, $q, $timeout,
    NstSvcCommentFactory, NstSvcPostFactory, NstSvcPostMap, NstSvcServer, NstSvcPostStorage, NST_EVENT_ACTION, NST_SRV_EVENT) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    //vm.viewSetting = {};
    //vm.post = {};
    vm.commentsBoardPreview = false;
    vm.urls = {
      reply_all: $state.href('compose-reply-all', {
        postId: vm.post.id
      }),
      reply_sender: $state.href('compose-reply-sender', {
        postId: vm.post.id
      }),
      forward: $state.href('compose-forward', {
        postId: vm.post.id
      })
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.reply = reply;
    vm.remove = remove;
    vm.allowToRemove = allowToRemove;
    vm.forward = {};
    vm.toggleCommentsBorad = toggleCommentsBorad;
    vm.sendComment = sendComment;


    /**
     * allowToRemove - the post has any place with delete access
     *
     * @return {boolean}   true if there is any place with delete access
     */
    function allowToRemove() {
      return vm.post.haveAnyPlaceWithDeleteAccess();
    }

    /**
     * removePost - remove the post from the places that the user selects
     */
    function remove() {
      vm.post.getPlacesHaveDeleteAccess().then(function(places) {

        if (moreThanOnePlace(places)) { //for multiple choices:
          previewPlaces(places).then(function(place) {
            performDelete(vm.post, place);
          }).catch(function(reason) {

          });
        } else { // only one place
          performDelete(vm.post, _.last(places));
        }

        function moreThanOnePlace(places) {
          return places.length > 1;
        }


        /**
         * previewPlaces - preview the places that have delete access and let the user to chose one
         *
         * @param  {NstPlace[]} places list of places to be shown
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
         * @param  {NstPlace}  place   the chosen place
         * @return {Promise}              the result of deletion
         */
        function deletePostFromPlace(place) {
          var defer = $q.defer();

          confirmOnDelete(vm.post, place).then(function() {
            PostFactoryService.remove(vm.post.id, place.id).then(function(res) {
              // reload the post, update the time line and notify the user
              // FIXME: the taost message appears only for the first time!
              $log.debug('The post is removed from the place.');
              $scope.$emit('post-removed', result);
              toastr.success('The post is removed from the place.');

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

    function reply() {
      $debug.log('Is not implemented yet!')
    }

    function forwad() {
      $debug.log('Is not implemented yet!')
    }

    function toggleCommentsBorad() {
      vm.commentsBoardPreview = !vm.commentsBoardPreview;
    }

    /**
     * send - add the comment to the list of the post comments
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

      vm.isSending = true;

      NstSvcPostFactory.get(vm.post.id).then(function(post) {
        NstSvcCommentFactory.addComment(post, body).then(function (comment) {
          // vm.post = post;
          e.currentTarget.value = '';
          vm.isSending = false;
        }).catch(function (error) {
          $log.debug(error);
        });
      }).catch(function (error) {
        $log.debug(error);
      });

      return false;
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
      return comment.sender.username === vm.user.username &&
        (Date.now() - comment.date < 20 * 60 * 1e3);
    }

    NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function(e) {
      switch (e.detail.timeline_data.action) {
        case NST_EVENT_ACTION.COMMENT_ADD:
        var postId = e.detail.timeline_data.post_id.$oid;

        if (vm.post.id == postId) {
          var commentId = e.detail.timeline_data.comment_id.$oid;
          NstSvcPostFactory.get(postId).then(function(post) {
              NstSvcCommentFactory.getComment(commentId, postId).then(function (comment) {
                  var result = post.addComment(comment);
                  if (result) {
                    NstSvcPostStorage.set(post.id, post);
                    vm.post = NstSvcPostMap.toMessage(post);
                  }
              }).catch(function (error) {
                $log.debug(error);
              });
          }).catch(function(error) {
            $log.debug(error);
          });
        }

        break;
        case NST_EVENT_ACTION.COMMENT_REMOVE:
          // TODO: optimize by droping the removed comment instead of replacing the post
          var postId = e.detail.timeline_data.post_id.$oid;
          var commentId = e.detail.timeline_data.comment_id.$oid;
          if (vm.post.id === postId) {
            var post = NstSvcPostFactory.get(postId).then(function (post) {
              commentIndex = _.findIndex(post.comments, function (comment) {
                return comment.id === commentId;
              });
              if (commentIndex) {
                post.comments.splice(commentIndex, 1);
                // TODO: Only the factory has access to a storage!
                NstSvcPostStorage.set(post.id, post);
                vm.post = NstSvcPostMap.toMessage(post);
              }
            }).catch(function (error) {
              $log.debug(error);
            });
          }
        break;
      }
    });
  }

})();
