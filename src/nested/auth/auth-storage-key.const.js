(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_AUTH_STORAGE_KEY', {
      USER: 'user',
      REMEMBER: 'remember_me'
    });
})();
