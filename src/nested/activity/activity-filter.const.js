(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .constant('NST_ACTIVITY_FILTER', {
      ALL : 'all',
      MESSAGES : 'messages',
      COMMENTS : 'comments',
      LOGS : 'log'
    });
})();
