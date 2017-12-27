(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskCustomFilterController', TaskCustomFilterController);

  /** @ngInject */
  function TaskCustomFilterController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcTranslation, NstSvcKeyFactory, NST_CUSTOM_FILTER, toastr) {
    var customFilters = [];

    var vm = this;

    vm.id = '';
    vm.name = '';
    vm.filters = [];

    if ($state.params && $state.params.id) {
      vm.id = parseInt($state.params.id);
    }

    (function () {
      getCustomFilters().then(function (data) {
        customFilters = data;
        var index = getFilterIndex();
        if (index > -1) {
          vm.name = customFilters[index].name;
          vm.filters = customFilters[index].filters;
        }
      });
    })();

    function getFilterIndex() {
      return _.findIndex(customFilters, {id: vm.id});
    }

    function getCustomFilters() {
      return NstSvcKeyFactory.getCache(NST_CUSTOM_FILTER.KEY_NAME).then(function (result) {
        if (result) {
          return JSON.parse(result);
        }
        return [];
      });
    }
  }
})();
