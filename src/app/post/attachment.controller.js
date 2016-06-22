(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentController', AttachmentController);

  /** @ngInject */
  function AttachmentController($location, $scope, $rootScope, $q,
                                AuthService, LoaderService) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
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
      if($scope.index == $scope.attachment.post.attachments.length - 1){
        $scope.index = -1;

      }
      $scope.attachment = $scope.attachment.post.attachments[++$scope.index];
      return LoaderService.inject($scope.attachment.getDownloadUrl());
    };

    $scope.prvAtt = function () {
      if($scope.index == 0) {
        $scope.index = $scope.attachment.post.attachments.length;
      }
      $scope.attachment = $scope.attachment.post.attachments[--$scope.index];
      return LoaderService.inject($scope.attachment.getDownloadUrl());
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
    $scope.attLoad = {
      success: function () {},
      fail: function () {}
    };
    LoaderService.inject($q(function(res ,rej) {
      $scope.attLoad.success = res;
      $scope.attLoad.fail = rej;
    }));
  }
})();
