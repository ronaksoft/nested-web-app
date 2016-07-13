(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_STORE_ROUTE', {
      DOWNLOAD: 'download',
      VIEW: 'view',
      STREAM: 'stream'
    });
})();
