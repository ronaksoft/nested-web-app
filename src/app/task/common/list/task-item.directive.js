(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskItem', taskItem);

  /** @ngInject */
  function taskItem() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/task/common/list/task-item.html',
      scope: {
        task: '=task',
      },
      link: function ($scope) {
      }
    };
  }

})();
