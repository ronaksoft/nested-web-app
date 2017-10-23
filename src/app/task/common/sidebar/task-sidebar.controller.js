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

      function createTask() {
        $uibModal.open({
          animation: false,
          size: 'create-task',
          templateUrl: 'app/task/pages/create-task/create-task.html',
          controller: 'CreateTaskController',
          controllerAs: 'ctrlCreateTask',
          backdropClass: 'taskBackDrop'
        })
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
