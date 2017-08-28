(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addLabelController', addLabelController);

  function addLabelController($timeout, $scope, $uibModalInstance, NstSvcTranslation,
                              _, NstSvcLabelFactory, NST_LABEL_SEARCH_FILTER, argv) {

    var vm = this;
    vm.labelSelectPlaceHolder = NstSvcTranslation.get('Select from below or type label name');
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
    vm.clear = clear;
    vm.selectedLabels = argv.addedLabels.length > 0 ?
      _.clone(argv.addedLabels).sort(function (a, b) {
        if (!a.public && !a.is_member && (b.is_member || b.public)) {
          return -1;
        } else {
          return 1;
        }
      }) : [];
    vm.firstTouch = false;
    var defaultLimit = 8;
    vm.setting = {
      skip: 0,
      limit: defaultLimit + vm.selectedLabels.length,
      filter: NST_LABEL_SEARCH_FILTER.MY_LABELS
    };

    vm.load();

    vm.submitLabels = function (){
      $uibModalInstance.close(vm.selectedLabels);
    };

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
    function updatedRecipient() {
      vm.firstTouch = true;
      $scope.$broadcast('SetFocus');
    }
    function clear(item) {
      vm.firstTouch = true;
      _.remove(vm.selectedLabels, function (o) {
        return item.id === o.id;
      });
    }
  }

})();
