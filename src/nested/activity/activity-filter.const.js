(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_ACTIVITY_FILTER', {
      ALL : 'all',
      MESSAGES : 'messages',
      COMMENTS : 'comments',
      LOGS : 'log'
    });
})();
