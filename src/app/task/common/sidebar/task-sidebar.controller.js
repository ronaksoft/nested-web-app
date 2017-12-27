(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskSidebarController', TaskSidebarController);

  /** @ngInject */
  function TaskSidebarController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcKeyFactory, NST_CUSTOM_FILTER) {
    var vm = this;
    var eventReferences = [];
    vm.openCustomFilterModal = openCustomFilterModal
    vm.createTask = createTask;
    vm.customFilters = [];

    (function () {
      getCustomFilters().then(function (data) {
        vm.customFilters = data;
      });
    })();

    function createTask(id) {
      if (id === undefined) {
        id = null;
      }
      $rootScope.$broadcast('open-create-task', id);
    }

    // TODO : consider callback and updating sidebar items
    function openCustomFilterModal() {
      $uibModal.open({
        animation: false,
        size: 'task modal-custom-filter',
        templateUrl: 'app/task/pages/custom-filter/custom-filter.html',
        controller: 'CustomFilterController',
        controllerAs: 'ctrlFilter',
        backdropClass: 'taskBackDrop'
      })
    }

    function getCustomFilters() {
      return NstSvcKeyFactory.get(NST_CUSTOM_FILTER.KEY_NAME).then(function (result) {
        if (result) {
          return JSON.parse(result);
        }
        return [];
      });
    }

    eventReferences.push($rootScope.$on('create-related-task', function (event, id) {
      $rootScope.$broadcast('open-create-task', id);
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });

    });

  }
})();
