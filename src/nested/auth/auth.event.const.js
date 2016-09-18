(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_AUTH_EVENT', {
      UNAUTHORIZE: 'unauthorize',
      AUTHORIZE: 'authorize',
      AUTHORIZE_FAIL: 'authorize-fail'
    });
})();
