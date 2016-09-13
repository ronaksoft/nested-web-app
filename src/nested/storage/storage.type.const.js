(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.cache')
    .constant('NST_STORAGE_TYPE', {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory',
      COOKIE: 'cookie'
    })
})();
