(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .constant('NST_LOADER_EVENT', {
      FINISHED: '__finished',
      INJECTED: '__injected'
    });
})();
