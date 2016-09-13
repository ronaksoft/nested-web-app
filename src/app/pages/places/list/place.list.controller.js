(function() {
  'use strict';

  angular.module('ronak.nested.web.place').controller('placeListController', placeListController);

  function placeListController($scope)
  {
    var vm = this;
    vm.places = $scope.$resolve.model.places;
    // vm.select = $scope.$resolve.model.select;
    // vm.dismiss = $scope.$resolve.model.dismiss;
  }

})();
