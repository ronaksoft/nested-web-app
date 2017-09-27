(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive(' taskProgressIcon', taskProgress);

  /** @ngInject */
  function taskProgress() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/task-progress/task-progress-icon.html',
      controller: 'taskProgressIconController',
      controllerAs: 'ctrl',
      link : function ($scope, $el, $attrs){

      }
    };
  }
})();
