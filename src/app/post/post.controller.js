(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($location, $scope, $stateParams, $q, AuthService, EVENT_ACTIONS, WS_EVENTS, WsService, NestedPost, NestedComment) {
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
        $scope.thePost.addComment(event.currentTarget.value).then(function (comment) {
          event.currentTarget.value = '';
          $scope.scrolling = $scope.unscrolled && true;
        });

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
  }
})();
