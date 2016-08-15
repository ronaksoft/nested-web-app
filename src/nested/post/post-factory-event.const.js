(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_POST_FACTORY_EVENT', {
      ADD: 'add',
      REMOVE: 'remove'
    });
})();
