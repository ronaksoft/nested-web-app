(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_LOADER_EVENT', {
      FINISHED: '__finished',
      INJECTED: '__injected'
    });
})();
