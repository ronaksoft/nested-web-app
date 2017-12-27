(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('CustomFilterController', CustomFilterController);

  /** @ngInject */
  function CustomFilterController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcTranslation, NstSvcKeyFactory, NST_CUSTOM_FILTER, toastr) {
    var customFilters = [];

    var vm = this;
    vm.id = -1;
    vm.name = '';
    vm.backDropClick = backDropClick;
    vm.addRow = addRow;
    vm.removeRow = removeRow;
    vm.createFilter = createFilter;
    var sampleModel = {
      condition: NST_CUSTOM_FILTER.CONDITION_ASSIGNEE,
      equivalent: NST_CUSTOM_FILTER.LOGIC_AND,
      data: {
        user: '',
        label: '',
        keyword: '',
        unit: NST_CUSTOM_FILTER.UNIT_DAY,
        range: 1,
        status: NST_CUSTOM_FILTER.STATUS_PROGRESS
      }
    };

    vm.items = [];

    (function () {
      getFilters().then(function (data) {
        console.log(data);
        customFilters = data;
        if (vm.id === -1) {
          addRow();
        } else {
          var index = getFilterIndex();
          vm.name = customFilters[index].name;
          vm.items = _.map(customFilters[index].filters, function (filter) {
            return parseData(filter);
          });
        }
      });
    })();

    function backDropClick() {
      $scope.$dismiss();
    }

    function addRow() {
      var clone = _.cloneDeep(sampleModel);
      vm.items.push(clone);
    }

    function removeRow(i) {
      vm.items.splice(i, 1);
    }

    function getFilterIndex() {
      return _.findIndex(customFilters, {id: vm.id});
    }

    function createFilter() {
      var index = getFilterIndex();
      if (index > -1) {
        customFilters[index].name = vm.name;
        customFilters[index].filters = _.map(vm.items, function (item) {
          return transformData(item);
        });
      } else {
        customFilters.push({
          id: customFilters.length + 1,
          name: vm.name,
          filters: _.map(vm.items, function (item) {
            return transformData(item);
          })
        });
      }

      setFilters(customFilters).then(function () {
        if (vm.id === -1) {
          toastr.success(NstSvcTranslation.get('Custom filter updated'));
        } else {
          toastr.success(NstSvcTranslation.get('Custom filter has been created'));
        }
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Something went wrong!'));
      });
    }

    function getDays(range, unit) {
      switch (unit) {
        case NST_CUSTOM_FILTER.UNIT_DAY:
          return range;
        case NST_CUSTOM_FILTER.UNIT_WEEK:
          return range * 7;
        case NST_CUSTOM_FILTER.UNIT_MONTH:
          return range * 30;
        case NST_CUSTOM_FILTER.UNIT_YEAR:
          return range * 365;
      }
    }

    function transformData(data) {
      var out = {
        con: data.condition,
        tmp: '',
        eq: data.equivalent,
        val: ''
      };

      switch (data.conditions) {
        case NST_CUSTOM_FILTER.CONDITION_STATUS:
          out.val = data.status;
          break;
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNOR:
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNEE:
          out.val = data.user;
          break;
        case NST_CUSTOM_FILTER.CONDITION_LABEL:
          out.val = data.label;
          break;
        case NST_CUSTOM_FILTER.CONDITION_KEYWORD:
          out.val = data.keyword;
          break;
        case NST_CUSTOM_FILTER.CONDITION_DUE_TIME:
          out.val = getDays(data.range, data.unit);
          out.tmp = data.range + '|' + data.unit;
          break;
      }

      return out;
    }

    function parseData(data) {
      var out = {
        user: '',
        label: '',
        keyword: '',
        unit: NST_CUSTOM_FILTER.UNIT_DAY,
        range: 1,
        status: NST_CUSTOM_FILTER.STATUS_PROGRESS
      };
      var tmp = '';

      switch (data.conditions) {
        case NST_CUSTOM_FILTER.CONDITION_STATUS:
          out.status = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNOR:
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNEE:
          out.user = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_LABEL:
          out.label = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_KEYWORD:
          out.keyword = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_DUE_TIME:
          tmp = data.tmp.split('|');
          out.range = parseInt(data.tmp[0]);
          out.unit = data.tmp[1];
          break;
      }

      return out;
    }

    function getFilters() {
      return NstSvcKeyFactory.get(NST_CUSTOM_FILTER.KEY_NAME).then(function (result) {
        if (result) {
          return JSON.parse(result);
        }
        return [];
      });
    }

    function setFilters(data) {
      return NstSvcKeyFactory.set(NST_CUSTOM_FILTER.KEY_NAME, JSON.stringify(data));
    }
  }
})();
