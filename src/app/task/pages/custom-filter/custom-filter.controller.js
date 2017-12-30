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
    vm.inProgress = false;
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
      if ($scope.$resolve !== undefined && $scope.$resolve.modalData !== undefined) {
        vm.id = $scope.$resolve.modalData.id;
      }
      vm.inProgress = true;
      getFilters().then(function (data) {
        console.log(data);
        customFilters = data;
        if (vm.id === -1) {
          addRow(0);
        } else {
          var index = getFilterIndex();
          vm.name = customFilters[index].name;
          vm.items = _.map(customFilters[index].filters, function (filter) {
            return parseData(filter);
          });
        }
        vm.inProgress = false;
      });
    })();

    function backDropClick() {
      $scope.$dismiss();
    }

    function addRow(index) {
      if (vm.items.length >= 6) {
        return;
      }
      index = index || vm.items.length;
      var clone = _.cloneDeep(sampleModel);
      clone.condition = getNewCondition(index);
      vm.items.push(clone);
    }

    var conditions = [
      NST_CUSTOM_FILTER.CONDITION_ASSIGNEE,
      NST_CUSTOM_FILTER.CONDITION_ASSIGNOR,
      NST_CUSTOM_FILTER.CONDITION_LABEL,
      NST_CUSTOM_FILTER.CONDITION_STATUS,
      NST_CUSTOM_FILTER.CONDITION_KEYWORD,
      NST_CUSTOM_FILTER.CONDITION_DUE_TIME
    ];

    function getNewCondition(index) {
      var selectedConditions = _.map(vm.items, function (item) {
        return item.condition;
      });
      selectedConditions = selectedConditions.slice(0, index);
      return _.difference(conditions, selectedConditions)[0];
    }

    function removeRow(i) {
      vm.items.splice(i, 1);
    }

    function getFilterIndex() {
      return _.findIndex(customFilters, {id: vm.id});
    }

    function getLastId() {
      if (customFilters.length > 0) {
        return customFilters[customFilters.length - 1].id;
      } else {
        return 0;
      }
    }

    function createFilter() {
      vm.inProgress = true;
      var index = getFilterIndex();
      if (index > -1) {
        customFilters[index].name = vm.name;
        customFilters[index].filters = _.map(vm.items, function (item) {
          return transformData(item);
        });
      } else {
        customFilters.push({
          id: getLastId() + 1,
          name: vm.name,
          filters: _.map(vm.items, function (item) {
            return transformData(item);
          })
        });
      }

      setFilters(customFilters).then(function () {
        if (vm.id === -1) {
          toastr.success(NstSvcTranslation.get('Custom filter has been created'));
          vm.id = getLastId();
        } else {
          toastr.success(NstSvcTranslation.get('Custom filter updated'));
        }
        $rootScope.$broadcast('task-custom-filter-updated');
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Something went wrong!'));
      }).finally(function () {
        vm.inProgress = false;
        $scope.$dismiss();
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

      switch (data.condition) {
        case NST_CUSTOM_FILTER.CONDITION_STATUS:
          out.val = data.data.status;
          break;
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNOR:
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNEE:
          out.val = data.data.user;
          break;
        case NST_CUSTOM_FILTER.CONDITION_LABEL:
          out.val = data.data.label;
          break;
        case NST_CUSTOM_FILTER.CONDITION_KEYWORD:
          out.val = data.data.keyword;
          break;
        case NST_CUSTOM_FILTER.CONDITION_DUE_TIME:
          out.val = getDays(data.data.range, data.data.unit);
          out.tmp = data.data.range + '|' + data.data.unit;
          break;
      }

      return out;
    }

    function parseData(data) {
      var out = {
        condition: data.con,
        equivalent: data.eq,
        data: {
          user: '',
          label: '',
          keyword: '',
          unit: NST_CUSTOM_FILTER.UNIT_DAY,
          range: 1,
          status: NST_CUSTOM_FILTER.STATUS_PROGRESS
        }
      };

      var tmp = '';

      switch (data.con) {
        case NST_CUSTOM_FILTER.CONDITION_STATUS:
          out.data.status = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNOR:
        case NST_CUSTOM_FILTER.CONDITION_ASSIGNEE:
          out.data.user = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_LABEL:
          out.data.label = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_KEYWORD:
          out.data.keyword = data.val;
          break;
        case NST_CUSTOM_FILTER.CONDITION_DUE_TIME:
          tmp = data.tmp.split('|');
          out.data.range = parseInt(data.tmp[0]);
          out.data.unit = data.tmp[1];
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
