(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addLabelController', addLabelController);

  function addLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _, NstSvcLabelFactory, NST_LABEL_SEARCH_FILTER,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace, argv) {

    var vm = this;
    vm.labelSelectPlaceHolder = 'Select from below or type label name…';
    vm.targetLimit = 100;
    vm.haveMore = true;
    vm.searchFn = _.debounce(search, 100);
    vm.oldKeyword = '';
    vm.loading = false;
    vm.updatedRecipient = updatedRecipient;
    vm.search = {
      results: []
    };
    vm.goDownward = false;
    vm.load = load;
    vm.selectedLabels = argv.addedLabels.length > 0 ? argv.addedLabels : [];
    vm.firstTouch = false;
    var defaultLimit = 8;
    vm.setting = {
      skip: 0,
      limit: defaultLimit + vm.selectedLabels.length,
      filter: NST_LABEL_SEARCH_FILTER.MY_LABELS,
    }

    vm.load();

    vm.submitLabels = function (){
      $uibModalInstance.close(vm.selectedLabels);
    }

    function search(keyword){
      if (typeof keyword !== 'string' || vm.loading) return;
      vm.loading = true;
      if ( keyword !== vm.oldKeyword) {
        restoreDefault();
      }
      NstSvcLabelFactory.search(keyword, vm.setting.filter, vm.setting.skip, vm.setting.limit).then(function (items){

        var sameItems = _.intersectionBy(items, vm.selectedLabels, 'title');
        var newItems = _.difference(items, sameItems).splice(0, defaultLimit);

        vm.search.results.push.apply(vm.search.results, newItems);

        // console.log(items.length, sameItems.length, items.length - (vm.selectedLabels.length - sameItems.length),vm.setting.skip);
        vm.setting.skip += items.length - (vm.selectedLabels.length - sameItems.length);
        vm.oldKeyword = keyword;
        vm.haveMore = vm.setting.limit === items.length;
        vm.loading = false;

        $timeout(function() {
          vm.goDownward = true;
        },100)
      });
    }
    function load() {
      vm.searchFn('');
    }
    function restoreDefault() {
      vm.setting.skip = 0;
      vm.search.results = [];
      vm.haveMore = true;
    }
    function updatedRecipient(onSelect, label) {
      vm.firstTouch = true;
      $scope.$broadcast('SetFocus');
    }
  }

})();
