(function() {
  'use strict';

  angular
    .module('ronak.nested.web.tasks')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {
    $stateProvider
    .state('app.tasks', {
      url: '/tasks',
      abstract: true,
      templateUrl: 'app/task/pages/glance/task-glance.html',
      controller: 'taskGlanceController',
      controllerAs: 'ctrl'
    })
    .state('app.tasks.glance',{
      url: '/glance',
      templateUrl: 'app/task/pages/glance/task-glance.html',
      controller: 'taskGlanceController',
      controllerAs: 'ctrl',
      options : {
        group : 'tasks',
        fullscreen : true
      }
    })

  }

})();
