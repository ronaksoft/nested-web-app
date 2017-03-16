(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .constant('NST_POST_FACTORY_EVENT', {
      ADD: 'add',
      REMOVE: 'remove',
      READ: 'read',
      BOOKMARKED : 'bookmarked',
      UNBOOKMARKED : 'unbookmarked'
    });
})();
