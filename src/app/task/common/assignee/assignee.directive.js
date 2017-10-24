(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskAssignee', taskAssignee);

  /** @ngInject */
  function taskAssignee() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/assignee/assignee.html',
      controller: 'TaskAssigneeController',
      controllerAs: 'ctlAssignee',
      scope: {},
      bindToController: {
        assigneesData: '=',
        assigneeFocus: '=',
        assigneeWithCandidate: '=',
        assigneePlaceholder: '@',
        addItem: '=?',
        removeItem: '=?',
        removeItems: '=',
        initData: '=',
        assigneeFocusMe: '=',
        assigneeExclude: '@'
      }
    };
  }

})();
