(function() {
  'use strict';

  angular.module('ronak.nested.web.message').controller('postDeleteController', postDeleteController);

  function postDeleteController($scope, $log)
  {
    var vm = this;
    vm.post = $scope.$resolve.model.post;
    vm.place = $scope.$resolve.model.place;
  }

})();
