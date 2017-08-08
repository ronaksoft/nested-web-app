(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addLabelController', addLabelController);

  function addLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _, NstSvcLabelFactory,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace, argv) {

    var vm = this;
    vm.color = 'D';
    vm.labelSelectPlaceHolder = 'Select from below or type label name…';
    vm.targetLimit = 8;
    vm.haveMore = false;
    vm.searchFn = search;
    vm.search = {};
    vm.setting = {
      skip: 0,
      limit: 8,
      filter: 'all',
    }
    vm.selectedLabels = argv.addedLabels.length > 0 ? argv.addedLabels : [];
    vm.firstItemsLength = vm.selectedLabels.length;

    (function (){
      search('');
    })();

    vm.submitLabels = function (){
      $uibModalInstance.close(vm.selectedLabels);
    }

    function search(keyword){
      NstSvcLabelFactory.search(keyword, vm.setting.filter, vm.setting.skip, vm.setting.limit).then(function (items){
        vm.search.results = items;
      });
    }
    
  }

})();
