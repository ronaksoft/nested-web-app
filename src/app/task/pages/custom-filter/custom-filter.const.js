(function () {

  'use strict';
  angular.module('ronak.nested.web.task').constant('NST_CUSTOM_FILTER', {
    KEY_NAME: 'nested.task.filter',

    LOGIC_AND: 'a',
    LOGIC_OR: 'o',
    LOGIC_IS: 'i',
    LOGIC_IS_NEXT: 'n',

    UNIT_DAY: 'd',
    UNIT_WEEK: 'w',
    UNIT_MONTH: 'm',
    UNIT_YEAR: 'y',

    STATUS_PROGRESS: 'p',
    STATUS_HOLD: 'h',
    STATUS_OVERDUE: 'o',

    CONDITION_ASSIGNEE: 'a',
    CONDITION_ASSIGNOR: 'c',
    CONDITION_LABEL: 'l',
    CONDITION_STATUS: 's',
    CONDITION_KEYWORD: 'k',
    CONDITION_DUE_TIME: 'd'
  });
})();
