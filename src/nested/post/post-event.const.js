(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .constant('NST_POST_EVENT', {
      READ: 'post-read',
      BOOKMARKED: 'post-bookmarked',
      UNBOOKMARKED: 'post-unbookmarked',
      REMOVE: 'post-remove',
      MOVE: 'post-move'
    });
})();
