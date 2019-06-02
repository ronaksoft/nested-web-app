(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstReminder', NstReminder);

  /** @ngInject */
  function NstReminder(NST_REMINDER_REPEAT_CASE) {
    function Reminder() {
      this.id = undefined;
      this.repeated = false;
      this.relative = false;
      this.interval = 0;
      this.timestamp = [];
      this.days = [];
      this.repeat_case = NST_REMINDER_REPEAT_CASE.DAYS;
    }

    Reminder.prototype = {};
    Reminder.prototype.constructor = Reminder;

    return Reminder;
  }
})();
