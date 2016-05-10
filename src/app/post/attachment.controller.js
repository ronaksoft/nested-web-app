(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentController', AttachmentController);

  /** @ngInject */
  function AttachmentController($location, AuthService, $scope) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    if ($scope.attachment) {
      
    }
  }
})();
