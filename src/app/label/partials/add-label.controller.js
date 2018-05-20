(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addLabelController', addLabelController);

  function addLabelController($timeout, $scope, $uibModalInstance, NstSvcTranslation,
                              _, NstSvcLabelFactory, NST_LABEL_SEARCH_FILTER, NstSvcSystem, argv) {

    var vm = this;
    vm.haveMore = true;
    vm.searchFn = _.debounce(search, 100);
    vm.keyword = '';
    vm.oldKeyword = '';
    var eventReferences = [];
    // WIll over ride by children
    vm.suggestsUpdated = function(){};
    vm.loading = false;
    vm.loaded = false;
    vm.search = {
      results: []
    };
    vm.suggestPickerConfig = {
      limit : 100,
      suggestsLimit: 8,
      singleRow: false,
      mode: 'label',
      alwaysVisible: true,
      placeholder: NstSvcTranslation.get('Select from below or type label name')
    };
    vm.goDownward = false;
    vm.searchMore = searchMore;
    vm.selectedLabels = argv.addedLabels.length > 0 ?
      _.clone(argv.addedLabels).sort(function (a, b) {
        if (!a.public && !a.is_member && (b.is_member || b.public)) {
          return -1;
        } else {
          return 1;
        }
      }) : [];
    vm.firstTouch = false;
    vm.addLabelLimit;
    vm.setting = {
      skip: 0,
      limit: vm.suggestPickerConfig.suggestsLimit + vm.selectedLabels.length,
      filter: NST_LABEL_SEARCH_FILTER.MY_LABELS
    };
    vm.submitLabels = function (){
      $uibModalInstance.close(vm.selectedLabels);
    };

    $timeout(function(){
      vm.searchFn('');

      eventReferences.push($scope.$watch(function () {
        return vm.keyword
      }, vm.searchFn, true));
      
      var initFlag = false
      eventReferences.push($scope.$watch(function () {
        return vm.selectedLabels.length
      }, function(val){
        if (initFlag) {
          vm.firstTouch = true;
        }
        initFlag = true;
      }));
    }, 128)

    loadConstants();

    function search(keyword){
      if (typeof keyword !== 'string' || vm.loading) return;
      
      vm.loading = true;
      if ( keyword !== vm.oldKeyword) {
        restoreDefault();
      }
      NstSvcLabelFactory.search(keyword, vm.setting.filter, vm.setting.skip, vm.setting.limit).then(function (items){
        var sameItems = _.intersectionBy(items, vm.selectedLabels, 'title');
        var newItems = _.difference(items, sameItems).splice(0, vm.suggestPickerConfig.suggestsLimit);
        vm.search.results = _.unionBy(vm.search.results, newItems, 'id');
        vm.setting.skip += items.length - (vm.selectedLabels.length - sameItems.length);
        vm.oldKeyword = keyword;
        vm.haveMore = vm.setting.limit === items.length;
        vm.loading = false;
        vm.loaded = true;
        vm.suggestsUpdated();
        $timeout(function() {
          vm.goDownward = true;
        },100)
      });
    }

    function loadConstants() {
      NstSvcSystem.getConstants().then(function (result) {
        vm.addLabelLimit = result.post_max_labels;
      }).catch(function () {
        vm.addLabelLimit = 10;
      });
    }

    function restoreDefault() {
      vm.setting.skip = 0;
      vm.search.results = [];
      vm.haveMore = true;
    }

    // function clear(item) {
    //   vm.firstTouch = true;
    //   _.remove(vm.selectedLabels, function (o) {
    //     return item.id === o.id;
    //   });
    //   vm.search.results.push(item);
    //   vm.search.results = _.uniqBy(vm.search.results, 'id');
    // }

    function searchMore() {
      vm.suggestPickerConfig.suggestsLimit++;
      return vm.searchFn(vm.keyword);
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });

    });
  }

})();
