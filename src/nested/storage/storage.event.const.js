(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.cache')
    .constant('NST_STORAGE_EVENT', {
      SET: 'set',
      MERGE: 'merge',
      CHANGE: 'change',
      EXPIRE: 'expire',
      REMOVE: 'remove',
      FLUSH: 'flush'
    })
})();
