(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_AUTH_STORAGE_KEY', {
      USER: 'user',
      REMEMBER: 'remember_me'
    });
})();
