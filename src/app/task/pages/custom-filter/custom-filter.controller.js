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
    vm.createFilter = createFilter;
    var sampleModel = {
      condition: 'assignee',
      equivalent: 'is',
      time: '',
    };

    vm.items = [];
    addRow();
    // $scope.$watch(function (){
    //     return vm.items;
    // }, function(n){
    //     console.log(n)
    // })

    function backDropClick() {
      $scope.$dismiss();
    }

    function addRow() {
      var clone = _.clone(sampleModel);
      vm.items.push(clone);
    }

    function removeRow(i) {
      vm.items.splice(i, 1);
    }

    function createFilter() {
      console.log(vm.items);
    }
  }
})();
