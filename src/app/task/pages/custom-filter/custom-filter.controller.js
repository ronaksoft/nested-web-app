(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('CustomFilterController', CustomFilterController);

  /** @ngInject */
  function CustomFilterController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcTranslation) {
    var vm = this;
    vm.backDropClick = backDropClick;
    vm.addRow = addRow;
    vm.removeRow = removeRow;


    vm.items = [{
      condition: 'assigne',
      equivalent: 'is',
      value: ''
    }];

    function backDropClick() {
      $scope.$dismiss();
    }

    function addRow() {
      vm.items.push({
        conditions: 'assigne'
      });
    }

    function removeRow(i) {
      vm.items.splice(i, 1);
    }
  }
})();
