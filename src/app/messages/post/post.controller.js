(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($q, $scope, $rootScope, $stateParams, $uibModal, $log, $state, $uibModalInstance, $timeout,
                          _, toastr, moment,
                          NST_COMMENT_EVENT, NST_POST_EVENT, NST_COMMENT_SEND_STATUS,
                          NstSvcAuth, NstSvcLoader, NstSvcTry, NstSvcPostFactory, NstSvcCommentFactory, NstSvcPostMap, NstSvcCommentMap, NstSvcPlaceFactory, NstUtility,
                          NstTinyComment, NstVmUser, postModel, postId) {
    var vm = this;

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
    vm.placesWithRemoveAccess = [];

    vm.postModel = undefined;
    vm.post = undefined;
    if (postModel) {
      vm.post = postModel;
      if (vm.post.comments) {
        vm.comments = vm.post.comments;
      }
    }
    vm.postId = postId || $stateParams.postId;

    vm.status = {
      postLoadProgress: false,
      commentRemoveProgress: false,
      commentLoadProgress: false,
      hasMoreComments: false,
      ready: false
    };

    vm.urls = {
      reply_all: $state.href('app.compose-reply-all', { postId: vm.postId }),
      reply_sender: $state.href('app.compose-reply-sender', { postId: vm.postId }),
      forward: $state.href('app.compose-forward', { postId: vm.postId })
    };


    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.sendComment = sendComment;
    vm.removeComment = removeComment;
    vm.loadMoreComments = loadComments;
    vm.allowToRemoveComment = allowToRemoveComment;
    vm.removePost = removePost;
    vm.hasRemoveAccess = hasRemoveAccess;
    vm.resend = resend;

    function loadComments() {
      vm.commentSettings.date = getDateOfOldestComment(vm.postModel);
      var commentCount = vm.comments.length;

      return reqGetComments(vm.postModel, vm.commentSettings).then(function (comments) {
        vm.comments = reorderComments(_.uniqBy(mapComments(comments).concat(vm.comments), 'id'));
        if (commentCount == 0){
            vm.revealNewComment = true;
        }
        // vm.scrolling = true;
      }).catch(function (error) {
        // TODO: create a service that handles errors
        // and knows what to do when an error occurs
      });
    }

    /**
     * sendComment - add the comment to the list of the post comments
     *
     * @param  {Event}  event   keypress event handler
     */
    function sendComment(event) {

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

      console.log('temp comment before save', temp);

      pushComment(temp);
      vm.revealNewComment = true;


      vm.nextComment = "";
      addComment(vm.postModel, body).then(function(comment) {
        // TODO: notify
        markCommentSent(temp.id, comment);
        vm.revealNewComment = true;
        event.currentTarget.value = '';
      }).catch(function(error) {
        markCommentFailed(temp.id);
        // TODO: decide && show toastr
      });

      return false;
    }

    function createCommentModel(body) {
      return new NstTinyComment({
        id : _.uniqueId('temp_'),
        body : body,
        date : moment(),
        sender : NstSvcAuth.user,
      });
    }

    function markCommentSent(tempCommentId, comment) {
      console.log('mark as success');
      var temp = _.find(vm.comments, { id : tempCommentId });
      console.log(temp);
      if (temp) {
        temp.isTemp = false;
        temp.status = NST_COMMENT_SEND_STATUS.SUCCESS;
        temp.id = comment.id;
        temp.date = comment.date;
        moveToHead(temp);
        console.log(vm.comments);
      }
    }

    function moveToHead(comment) {
      var index = _.findIndex(vm.comments, { id : comment.id });
      if (index > 0) {
        var item = vm.comments[index];
        vm.comments.splice(index, 1);
        pushComment(item);
      }
    }

    function markCommentFailed(tempCommentId) {
      console.log('mark as fail');
      var temp = _.find(vm.comments, { id : tempCommentId });
      console.log('found temp', temp);
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
      reqRemoveComment(vm.postModel, comment).then(function(post) {
        NstUtility.collection.dropById(vm.comments, comment.id);
      }).catch(function(error) {
        // TODO: decide && show toastr
      });
    }

    /**
     * hasRemoveAccess - the post has any place with delete access
     *
     * @param  {NstPost} post  current post
     * @return {type}             true if there is any place with delete access
     */
    function hasRemoveAccess(post) {
      return post.haveAnyPlaceWithDeleteAccess();
    }

    /**
     * removePost - remove the post from the places that the user selects
     *
     * @param  {NstPost} post current post
     */
    function removePost(post) {
        if (vm.placesWithRemoveAccess.length > 1) { //for multiple choices:
          previewPlaces(vm.placesWithRemoveAccess).then(function(place) {
            performDelete(post, place);
          }).catch(function(reason) {

          });
        } else { // only one place
          performDelete(post, _.last(vm.placesWithRemoveAccess));
        }


        /**
         * previewPlaces - preview the places that have delete access and let the user to choose one
         *
         * @param  {type} places list of places to be shown
         */
        function previewPlaces(places) {

          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/pages/places/list/place.list.modal.html',
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

              NstUtility.collection.dropById(post.allPlaces, place.id);
              NstUtility.collection.dropById(vm.placesWithRemoveAccess, place.id);

              NstSvcPlaceFactory.filterPlacesByReadPostAccess(post.allPlaces).then(function (places) {
                if (_.isArray(places) && places.length === 0) {
                  $uibModalInstance.dismiss();
                }

              }).catch(function (error) {
                $log.debug(error);
              });

              toastr.success(NstUtility.string.format('The post has been removed from {0}.', place.name));

              $rootScope.$broadcast('post-removed', {
                postId : post.id,
                placeId : place.id
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
            templateUrl: 'app/messages/post/post.delete.html',
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
    }

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    (function () {
      reqGetPost(vm.postId).then(function (post) {
        vm.postModel = post;
        vm.post = mapPost(vm.postModel);
        // if (vm.post.comments) {
        //   vm.comments = vm.post.comments;
        // }

        return NstSvcPlaceFactory.filterPlacesByRemovePostAccess(post.places);
      }).then(function (placesWithRemoveAccess) {
        vm.placesWithRemoveAccess = placesWithRemoveAccess;

        return loadComments();
      }).then(function () {
        vm.status.ready = true;
        NstSvcPostFactory.dispatchEvent(new CustomEvent(NST_POST_EVENT.VIEWED, {
          detail: {
            postId : vm.post.id,
            comments : vm.comments
          }
        }));
        $timeout(function () {
          vm.revealNewComment = true;
        });
      });
    })();

    $scope.unscrolled = true;
    vm.checkScroll = function(event) {
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

    function reqGetPost(id) {
      vm.status.postLoadProgress = true;

      return NstSvcLoader.inject(NstSvcPostFactory.get(id)).then(function (post) {


        NstSvcPostFactory.read([id]);
        vm.status.postLoadProgress = false;

        return $q(function (res) {
          res(post);
        });
      }).catch(function (error) {
        vm.status.postLoadProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    function reqGetComments(post, settings) {
      vm.status.commentLoadProgress = true;

      return NstSvcLoader.inject(NstSvcCommentFactory.retrieveComments(post, settings)).then(function (comments) {
        vm.status.commentLoadProgress = false;
        // the conditions says maybe there are more comments that the limit
        vm.status.hasMoreComments = comments.length >= settings.limit;

        return $q(function (res) {
          res(comments);
        });
      }).catch(function (error) {
        vm.status.commentLoadProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    function resend(model) {
      model.status = NST_COMMENT_SEND_STATUS.PROGRESS;
      model.isTemp = true;
      addComment(vm.postModel, model.body).then(function(comment) {
        // TODO: notify
        markCommentSent(model.id, comment);
        event.currentTarget.value = '';
        vm.revealNewComment = true;
      }).catch(function(error) {
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
      var alreadyPushed = _.some(vm.comments, { id: model.id });

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

    NstSvcCommentFactory.addEventListener(NST_COMMENT_EVENT.ADD, function (event) {
      if (vm.postId == event.detail.postId) {
        if (NstSvcAuth.user.id === event.detail.comment.sender.id && _.some(vm.comments, { body : event.detail.comment.body })) {
          return false;
        } else {
          pushComment(mapComment(event.detail.comment));
        }
      }
    });

    NstSvcCommentFactory.addEventListener(NST_COMMENT_EVENT.REMOVE, function (event) {
      if (vm.postId == event.detail.postId) {

      }
    });

    /*****************************
     *****   Other Methods    ****
     *****************************/

     function hasRemoveAccess () {
       return vm.placesWithRemoveAccess && vm.placesWithRemoveAccess.length > 0;
     }

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

    function findOldestComment(post) {
      return _.first(_.orderBy(post.comments, 'date'));
    }

    function getDateOfOldestComment(post) {
      var oldest = findOldestComment(post);
      var date = null;
      if (oldest) {
        date = oldest.date;
      } else {
        date = new Date();
      }
      date.setMilliseconds(date.getMilliseconds() - 1);

      return date.valueOf();
    }

    function allowToRemoveComment(comment) {
      if (comment && comment.id && vm.user && vm.user.id) {
        var now = Date.now();
        return comment.sender.username === vm.user.id
        && ((now - comment.date) < 20 * 60 * 1e3);
      }

      return false;
    }

    $uibModalInstance.result.finally(function () {
      $rootScope.$broadcast('post-modal-closed', {
        postId: vm.post.id,
        comments: vm.comments,
        totalCommentsCount: vm.postModel.counters.comment || vm.comments.length
      });
    });
  }
})();
