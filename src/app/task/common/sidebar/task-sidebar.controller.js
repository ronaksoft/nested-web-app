(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskSidebarController', TaskSidebarController);

  /** @ngInject */
  function TaskSidebarController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcKeyFactory, NstSvcTaskDraft, NST_CUSTOM_FILTER) {
    var vm = this;
    var eventReferences = [];
    vm.openCustomFilterModal = openCustomFilterModal;
    vm.createTask = createTask;
    vm.customFilters = [];
    vm.hasDraft = false;

    (function () {
      getCustomFilters(true);
      getCustomFilters(false);

      vm.hasDraft = NstSvcTaskDraft.has();
    })();

    function createTask(id) {
      if (id === undefined) {
        id = null;
      }
      $rootScope.$broadcast('open-create-task', {relatedTaskId: id});
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

    eventReferences.push($rootScope.$on('create-related-task', function (event, data) {
      $rootScope.$broadcast('open-create-task', {relatedTaskId: data.id});
    }));

    eventReferences.push($rootScope.$on('create-related-task-from-post', function (event, data) {
      $rootScope.$broadcast('open-create-task', {relatedPostId: data.id});
    }));

    eventReferences.push($rootScope.$on('open-task-custom-filter', function (event, data) {
      openCustomFilterModal(data.id);
    }));

    eventReferences.push($rootScope.$on('task-custom-filter-updated', function () {
      getCustomFilters(true);
    }));

    eventReferences.push($rootScope.$on('task-draft-change', function () {
      vm.hasDraft = NstSvcTaskDraft.has();
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
