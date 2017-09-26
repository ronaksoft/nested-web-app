(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {
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
      options : {
        group : 'task',
        fullscreen : true
      }
    })

  }

})();
