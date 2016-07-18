(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_AUTH_EVENT', {
      UNAUTHORIZE: 'unauthorize',
      AUTHORIZE: 'authorize',
      AUTHORIZE_FAIL: 'authorize-fail'
    });
})();
