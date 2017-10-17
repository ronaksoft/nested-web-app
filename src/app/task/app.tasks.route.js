(function() {
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
      templateUrl: 'app/task/pages/glance/task-glance.html',
      controller: 'taskGlanceController',
      controllerAs: 'ctrl'
    })
    .state('app.task.glance',{
      url: '/glance',
      templateUrl: 'app/task/pages/glance/task-glance.html',
      controller: 'taskGlanceController',
      controllerAs: 'ctrl',
      options: {
        group: 'task',
        primary: true,
        fullscreen: true
      }
    })
    .state('app.task.edit',{
      url: '/edit/:taskId',
      params: {
        taskId: NST_DEFAULT.STATE_PARAM
      },
      options: {
        group: 'task'
      },
      onEnter: ['$rootScope', function ($rootScope) {
        setTimeout(function () {
          $rootScope.$broadcast('open-task');
        }, 10);
      }]
    })

  }

})();
