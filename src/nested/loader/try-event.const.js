(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_TRY_EVENT', {
      MAX_EXCEED: 'max_exceed',
      RESOLVED: 'resolved',
      RETRY: 'retry'
    });
})();
