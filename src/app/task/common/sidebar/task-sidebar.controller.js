(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskSidebarController', TaskSidebarController);

  /** @ngInject */
  function TaskSidebarController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcKeyFactory, NST_CUSTOM_FILTER) {
    var vm = this;
    var eventReferences = [];
    vm.openCustomFilterModal = openCustomFilterModal;
    vm.createTask = createTask;
    vm.customFilters = [];

    (function () {
      getCustomFilters(true);
      getCustomFilters(false);
    })();

    function createTask(id) {
      if (id === undefined) {
        id = null;
      }
      $rootScope.$broadcast('open-create-task', id);
    }

    // TODO : consider callback and updating sidebar items
    function openCustomFilterModal(id) {
      id = id || -1;
      $uibModal.open({
        animation: false,
        size: 'task modal-custom-filter',
        templateUrl: 'app/task/pages/custom-filter/custom-filter.html',
        controller: 'CustomFilterController',
        controllerAs: 'ctrlFilter',
        backdropClass: 'taskBackDrop',
        resolve: {
          modalData: {
            id: id
          }
        }
      })
    }

    function getCustomFilters(cache) {
      NstSvcKeyFactory.get(NST_CUSTOM_FILTER.KEY_NAME, cache).then(function (result) {
        if (result) {
          vm.customFilters = JSON.parse(result);
        }
      });
    }

    eventReferences.push($rootScope.$on('create-related-task', function (event, id) {
      $rootScope.$broadcast('open-create-task', id);
    }));

    eventReferences.push($rootScope.$on('open-task-custom-filter', function (event, data) {
      console.log(data);
      openCustomFilterModal(data.id);
    }));


    eventReferences.push($rootScope.$on('task-custom-filter-updated', function () {
      getCustomFilters(true);
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
