(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostController', PostController);

  /** @ngInject */
  function PostController($location, $scope, $stateParams, AuthService, NestedPost) {
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

    $scope.thePost.comments.length > 0 || $scope.thePost.loadComments();

    $scope.commentKeyUp = function (event) {
      var noSend = event.shiftKey || event.ctrlKey;
      if (13 === event.keyCode && !noSend) {
        $scope.thePost.addComment(event.currentTarget.value).then(function (comment) {
          event.currentTarget.value = '';
        });

        return false;
      }
    };

    $scope.user = AuthService.user;
  }
})();
