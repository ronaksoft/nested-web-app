(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, NST_DEFAULT) {
    $stateProvider
      .state('app.task', {
        url: '/task',
        abstract: true,
        templateUrl: 'app/task/common/abstract/task-abstract.html',
        controller: 'TaskAbstractController',
        controllerAs: 'abstractCtrl'
      })
      .state('app.task.glance', {
        url: '/glance',
        templateUrl: 'app/task/pages/tasks/tasks.html',
        controller: 'TasksController',
        controllerAs: 'ctrl',
        options: {
          group: 'task',
          primary: true
        }
      })
      .state('app.task.assigned_to_me', {
        url: '/assigned_to_me/:filter',
        params: {
          filter: 'normal'
        },
        templateUrl: 'app/task/pages/tasks/tasks.html',
        controller: 'TasksController',
        controllerAs: 'ctrl',
        options: {
          group: 'task',
          primary: true
        }
      })
      .state('app.task.created_by_me', {
        url: '/created_by_me/:filter',
        params: {
          filter: 'normal'
        },
        templateUrl: 'app/task/pages/tasks/tasks.html',
        controller: 'TasksController',
        controllerAs: 'ctrl',
        options: {
          group: 'task',
          primary: true
        }
      })
      .state('app.task.watchlist', {
        url: '/watchlist/:filter',
        params: {
          filter: 'normal'
        },
        templateUrl: 'app/task/pages/tasks/tasks.html',
        controller: 'TasksController',
        controllerAs: 'ctrl',
        options: {
          group: 'task',
          primary: true
        }
      })
      .state('app.task.edit', {
        url: '/edit/:taskId',
        params: {
          taskId: NST_DEFAULT.STATE_PARAM
        },
        options: {
          group: 'task'
        },
        onEnter: ['$rootScope', '$uibModal', function ($rootScope, $uibModal) {
          $uibModal.open({
            animation: false,
            size: 'task modal-edit-task',
            templateUrl: 'app/task/pages/edit-task/edit-task.html',
            controller: 'EditTaskController',
            controllerAs: 'ctrlEditTask',
            backdropClass: 'taskBackDrop'
          }).result.catch(function () {
            $rootScope.goToLastState(true);
          });
        }]
      })
      .state('app.task.search', {
        url: '/search/:search/:advanced',
        params: {
          search: NST_DEFAULT.STATE_PARAM,
          advanced: 'false'
        },
        reloadOnSearch: false,
        templateUrl: 'app/task/pages/search/search.html',
        controller: 'SearchController',
        controllerAs: 'ctlSearch',
        options: {
          group: 'task',
          primary: true
        }
      }).state('app.task.custom_filter', {
      url: '/custom_filter/:id',
      params: {
        filter: '-'
      },
      templateUrl: 'app/task/pages/tasks/tasks.html',
      controller: 'TasksController',
      controllerAs: 'ctrl',
      options: {
        group: 'task',
        primary: true
      }
    })

  }

})();
