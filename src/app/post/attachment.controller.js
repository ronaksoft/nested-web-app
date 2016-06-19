(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentController', AttachmentController);

  /** @ngInject */
  function AttachmentController($location, $scope, $rootScope, $q,
                                AuthService, LoaderService) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    LoaderService.inject();

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
      $scope.progressbar.start();
      $scope.index = ($scope.index + 1) % $scope.attachment.post.attachments.length;
      $scope.attachment = $scope.attachment.post.attachments[$scope.index];

      return $scope.attachment.getDownloadUrl().then(function () {
        //$scope.progressbar.complete();
      });
    };

    $scope.prvAtt = function () {
      var length = $scope.attachment.post.attachments.length;
      $scope.progressbar.start();
      $scope.index = (length + $scope.index - 1) % length;
      $scope.attachment = $scope.attachment.post.attachments[$scope.index];

      return $scope.attachment.getDownloadUrl().then(function () {
        //$scope.progressbar.complete();
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
