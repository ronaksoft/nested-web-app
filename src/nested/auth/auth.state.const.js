(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_AUTH_STATE', {
      UNAUTHORIZED: 'unauthorized',
      AUTHORIZING: 'authorizing',
      AUTHORIZED: 'authorized'
    });
})();
