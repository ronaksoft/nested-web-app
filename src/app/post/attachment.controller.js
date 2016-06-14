(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentController', AttachmentController);

  /** @ngInject */
  function AttachmentController($location, AuthService, $scope) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    vm.getIndex = function () {
      $scope.index = $scope.attachment.post.attachments.map(function (att) {
        return att.id;
      }).indexOf($scope.attachment.id);

      return $scope.index;
    };

    $scope.nextAtt = function () {
      if($scope.index < $scope.attachment.post.attachments.length - 1){
        $scope.attachment = $scope.attachment.post.attachments[++$scope.index];
      }

      return $scope.attachment.getDownloadUrl();
    };
    $scope.prvAtt = function () {
      if($scope.index > 0) {
        $scope.attachment = $scope.attachment.post.attachments[--$scope.index];
      }

      return $scope.attachment.getDownloadUrl();
    };

    if ($scope.attachment) {
      vm.getIndex();
    }

    $scope.download = function (attachment, event) {
      var attach = angular.copy(attachment);

      attach.getDownloadUrl().then(function (url) {
        window.open(url,'_blank');
      });

      if (event) {
        event.preventDefault();
      }
    };
  }
})();
