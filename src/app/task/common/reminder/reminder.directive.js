(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskReminder', taskReminder);

  /** @ngInject */
  function taskReminder() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/reminder/reminder.html',
      controller: 'TaskReminderController',
      controllerAs: 'ctlReminder',
      scope: {},
      bindToController: {
        remindersData: '=',
        reminderFocus: '=',
        taskDueDate: '=',
        addItem: '=?',
        removeItem: '=?',
        reminderPlaceholder: '@',
        removeItems: '=',
        reminderClick: '=?'
      }
    };
  }

})();
