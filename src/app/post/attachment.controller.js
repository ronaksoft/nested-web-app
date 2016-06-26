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

    $scope.attLoad = {
      success: function () {},
      fail: function () {}
    };

    if ($scope.attachment) {
      vm.getIndex();

      if ('image' == $scope.attachment.mimeType.split('/')[0]) {
        LoaderService.inject($q(function(res ,rej) {
          $scope.attLoad.success = res;
          $scope.attLoad.fail = rej;
        }));
      }
    }

    $scope.nextAtt = function () {
      if($scope.index == $scope.attachment.post.attachments.length - 1){
        $scope.index = -1;
      }
      $scope.attachment = $scope.attachment.post.attachments[++$scope.index];

      return LoaderService.inject($scope.attachment.getDownloadUrl().then(function () {
        return 'image' == $scope.attachment.mimeType.split('/')[0] ? $q(function(res ,rej) {
          $scope.attLoad.success = res;
          $scope.attLoad.fail = rej;
        }) : $q(function (res) {
          res.apply(null, this.input);
        }.bind({ input: arguments }));
      }));
    };

    $scope.prvAtt = function () {
      if($scope.index == 1) {
        $scope.index = $scope.attachment.post.attachments.length + 1;
      }
      $scope.attachment = $scope.attachment.post.attachments[--$scope.index];

      return LoaderService.inject($scope.attachment.getDownloadUrl().then(function () {
        return 'image' == $scope.attachment.mimeType.split('/')[0] ? $q(function(res ,rej) {
          $scope.attLoad.success = res;
          $scope.attLoad.fail = rej;
        }) : $q(function (res) {
          res.apply(null, this.input);
        }.bind({ input: arguments }));
      }));
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
