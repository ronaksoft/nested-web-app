(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($location, $scope, $stateParams, $uibModal, $q, $log, _, toastr, AuthService, EVENT_ACTIONS, WS_EVENTS, WsService, NestedPost, NestedComment) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    if (!$scope.thePost) {
      if (!$stateParams.postId) {
        $location.path('/').replace();
      }

      $scope.thePost = new NestedPost($stateParams.postId);
    }

    $scope.thePost.comments.length > 0 || $scope.thePost.loadComments().then(function () {
      $scope.scrolling = true;
    });

    $scope.unscrolled = true;
    vm.checkScroll = function (event) {
      var element = event.target;

      $scope.unscrolled = element.scrollTop === (element.scrollHeight - element.offsetHeight);
    };

    $scope.commentKeyUp = function (event) {
      var noSend = event.shiftKey || event.ctrlKey;
      if (13 === event.keyCode && !noSend) {
        var body = event.currentTarget.value.trim();

        if (body.length > 0) {
          event.currentTarget.value = '';
          $scope.thePost.addComment(body).then(function (comment) {
            $scope.scrolling = $scope.unscrolled && true;
          }).catch(function (comment) {
            this.value = comment;
          }.bind(event.currentTarget));
        }

        return false;
      }
    };

    $scope.user = AuthService.user;

    WsService.addEventListener(WS_EVENTS.TIMELINE, function (tlEvent) {
      switch (tlEvent.detail.timeline_data.action) {
        case EVENT_ACTIONS.COMMENT_ADD:
        case EVENT_ACTIONS.COMMENT_REMOVE:

          if ($scope.thePost.id == tlEvent.detail.timeline_data.post_id.$oid) {
            var commentId = tlEvent.detail.timeline_data.comment_id.$oid;

            (new NestedComment($scope.thePost)).load(commentId).then(function (comment) {
              $scope.thePost.addComment(comment).then(function () {
                $scope.scrolling = $scope.unscrolled && true;

                return $q(function (res) {
                  res();
                });
              }).catch(function () {});
            });
          }

          break;
      }
    });

    $scope.deletePost = deletePost;

    function deletePost (post) {
      post.getPlacesHaveDeleteAccess(post).then(function (places) {

        if (moreThanOnePlace(places)) { //for multiple choices:
          previewPlaces(places).then(function(place) {
            performDelete(post, place);
          }).catch(function (reason) {

          });
        }
        else { // only one place
          performDelete(post, _.last(places));
        }

        function moreThanOnePlace(places) {
          return places.length > 1;
        }

        function previewPlaces(places) {

          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/places/list/place.list.modal.html',
            controller: 'placeListController',
            controllerAs: 'vm',
            keyboard: true,
            size: 'sm',
            resolve: {
              model: function () {
                return {
                  places: places
                };
              }
            }
          });

          return modal.result;
        }

        function deletePostFromPlace(post, place) {
          var defer = $q.defer();

          confirmOnDelete(post, place).then(function () {
            post.deleteFromPlace(post.id, place.id).then(function(res) {
              // reload the post, update the time line and notify the user
              // FIXME: the taost message appears only for the first time!
              toastr.success('The post is removed from the place.');
              post.load(post.id).then(function (result) {
                $scope.$emit('post-removed', result);
              }).catch(function (res) {
                $log.debug('error: ', res);
              });
            }).catch(function(res) {
              if (res.err_code === 1){
                $log.debug('You are not allowed to remove the post!');
              }
              defer.reject(res);
            });
          }).catch(function (reason) {
            $log.debug('The delete confirmation was rejected')
          });

          return defer.promise;
        }

        function performDelete(post, place) {
          deletePostFromPlace(post, place).then(function (res) {
            $log.debug(res);
          }).catch(function (error) {
            $log.debug(error);
          })
        }

        function confirmOnDelete(post, place) {
          var modal = $uibModal.open({
            animation: false,
            templateUrl: 'app/post/post.delete.html',
            controller: 'postDeleteController',
            controllerAs: 'vm',
            size: 'sm',
            keyboard: true,
            resolve: {
              model: function () {
                return {
                  post: post,
                  place: place
                };
              }
            }
          });

          return modal.result;
        }
      }).catch(function (error) {
        $log.debug(error);
      });
    }
  }
})();
