(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_AUTH_STATE', {
      UNAUTHORIZED: 'unauthorized',
      AUTHORIZING: 'authorizing',
      AUTHORIZED: 'authorized'
    });
})();
