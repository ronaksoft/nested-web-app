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
        $rootScope.$broadcast('open-create-task', id);
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
