(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostCardController', PostCardController);

  function PostCardController($rootScope, $scope, $stateParams, $log, $q, $timeout,
    NstSvcCommentFactory, NstSvcPostFactory) {
    var vm = this;
    //vm.viewSetting = {};
    //vm.post = {};
    vm.commentsBoardPreview = false;

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
      console.log('sending', e);
      console.log(vm.post);
      if (!sendKeyIsPressed(e)) {
        return;
      }

      var body = extractCommentBody(e);
      if (body.length === 0) {
        return;
      }

      vm.isSending = true;

      NstSvcPostFactory.get(vm.post.id).then(function (post) {
        return NstSvcCommentFactory.addComment(post, body)
      }).then(function(post) {
        vm.post = post;
        e.currentTarget.value = '';
        vm.isSending = false;
        // TODO: notify
      }).catch(function(error) {
        // TODO: decide
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
      return comment.sender.username === vm.user.username
        && (Date.now() - comment.date < 20 * 60 * 1e3);
    }
  }

})();
