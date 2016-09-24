(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_STORAGE_TYPE', {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory',
      COOKIE: 'cookie'
    })
})();
