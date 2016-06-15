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

    if ($scope.attachment) {
      vm.getIndex();
    }

    $scope.nextAtt = function () {
      var lenght = $scope.attachment.post.attachments.length - 1;
      if($scope.index < lenght){
        $scope.progressbar.start();
        $scope.attachment = $scope.attachment.post.attachments[++$scope.index];
      }else if($scope.index == lenght) {
        $scope.progressbar.start();
        $scope.index = -1;
        $scope.attachment = $scope.attachment.post.attachments[++$scope.index];
      }

      return $scope.attachment.getDownloadUrl().then(function () {
        $scope.progressbar.complete();
      });
    };
    $scope.prvAtt = function () {
      var lenght = $scope.attachment.post.attachments.length - 1;
      if($scope.index > 0) {
        $scope.progressbar.start();
        $scope.attachment = $scope.attachment.post.attachments[--$scope.index];
      }else if($scope.index == 0) {
        $scope.progressbar.start();
        $scope.index = lenght;
        $scope.attachment = $scope.attachment.post.attachments[lenght];
      }

      return $scope.attachment.getDownloadUrl().then(function () {
        $scope.progressbar.complete();
      });
    };

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
