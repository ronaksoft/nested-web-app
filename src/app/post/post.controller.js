(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($location, $scope, $stateParams, $interval, AuthService, NestedPost, NestedComment) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    if (!$scope.thePost) {
      if (!$stateParams.postId) {
        $location.path('/').replace();
      }

      $scope.thePost = new NestedPost($stateParams.postId);
    }

    $scope.thePost.comments.length > 0 || $scope.thePost.loadComments();

    $scope.commentKeyUp = function (event) {
      if (13 === event.keyCode) {
        $scope.thePost.addComment(event.currentTarget.value).then(function (comment) {
          event.currentTarget.value = '';
        });
      }
    };

    $scope.user = AuthService.user;
  }
})();
