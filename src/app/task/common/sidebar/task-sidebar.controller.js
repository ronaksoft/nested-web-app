(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('TaskSidebarController', TaskSidebarController);

    /** @ngInject */
    function TaskSidebarController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope) {
      var vm = this;
      var eventReferences = [];

      vm.createTask = createTask;

      function createTask(id) {
        if (id === undefined) {
          id = null;
        }
        $uibModal.open({
          animation: false,
          size: 'create-task',
          templateUrl: 'app/task/pages/create-task/create-task.html',
          controller: 'CreateTaskController',
          controllerAs: 'ctrlCreateTask',
          backdropClass: 'taskBackDrop',
          resolve: {
            modalData: {
              relatedTaskId: id
            }
          }
        });
      }

      eventReferences.push($rootScope.$on('create-related-task', function (event, id) {
        createTask(id);
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
