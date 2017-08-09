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
    vm.targetLimit = 22;
    vm.haveMore = false;
    vm.searchFn = search;
    vm.search = {};
    vm.selectedLabels = argv.addedLabels.length > 0 ? argv.addedLabels : [];
    vm.firstItemsLength = vm.selectedLabels.length;
    vm.setting = {
      skip: 0,
      limit: 8 + vm.selectedLabels.length,
      filter: 'all',
    }

    search('');

    vm.submitLabels = function (){
      $uibModalInstance.close(vm.selectedLabels);
    }

    function search(keyword){
      NstSvcLabelFactory.search(keyword, vm.setting.filter, vm.setting.skip, vm.setting.limit).then(function (items){
        // TODO remove  vm.selectedLabels items from results
        console.log(items, vm.selectedLabels);
        var sameItems = _.intersectionBy(items, vm.selectedLabels, 'title');
        vm.search.results = _.difference(items, sameItems);;
      });
    }
    
  }

})();
