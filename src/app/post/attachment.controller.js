(function() {
  'use strict';

  angular
    .module('nested')
    .constant('VIEWPORT', {
      DOWNLOAD: 'download',
      VIEW: 'view',
      STREAM: 'dontUseStream'
    }).controller('AttachmentController', AttachmentController);

  /** @ngInject */
  function AttachmentController($location, $scope, $rootScope, $q, $window,
                                AuthService, LoaderService, VIEWPORT) {
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


      return LoaderService.inject($scope.attachment.getViewUrl().then(function () {
        return 'image' == $scope.attachment.mimeType.split('/')[0] ? $q(function(res ,rej) {
          $scope.attLoad.success = res;
          $scope.attLoad.fail = rej;
        }) : $q(function (res) {
          res.apply(null, this.input);
        }.bind({ input: arguments }));
      }));
    };

    $scope.prvAtt = function () {
      if($scope.index == 0) {
        $scope.index = $scope.attachment.post.attachments.length;
      }
      $scope.attachment = $scope.attachment.post.attachments[--$scope.index];

      return LoaderService.inject($scope.attachment.getViewUrl().then(function () {
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
        $window.location.assign(url);
      });

      if (event) {
        event.preventDefault();
      }
    };
  }
})();
