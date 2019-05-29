(function() {
    'use strict';
  
    angular
      .module('ronak.nested.web.task')
      .constant('NST_REMINDER_REPEAT_CASE', {
        DAYS: 'days',
        WEEKS: 'weeks'
      })
      .constant('NST_REMINDER_TYPES', {
        thirtyMin: 30,
        oneHour: 60,
        twoHour: 2 * 60,
        threeHour: 3 * 60,
        fiveHour: 5 * 60
      });
  })();
  