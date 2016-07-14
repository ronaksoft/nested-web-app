(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostCardController', PostCardController);

  function PostCardController($rootScope, $scope, $stateParams, $log, $q, $timeout,
    postModel, viewSetting,
    NstSvcPostFactory) {
    var vm = this;

    vm.viewSetting = viewSetting;
    vm.post = postModel;
    vm.commentsBoardPreview = false;

    vm.reply = reply;
    vm.remove = remove;
    vm.allowToRemove = allowToRemove;
    vm.forward = forward;
    vm.toggleCommentsBorad = toggleCommentsBorad;


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

  }

})();
