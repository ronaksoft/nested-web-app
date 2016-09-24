(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_COMMENT_EVENT', {
      ADD: 'post-comment-added',
      REMOVE: 'post-comment-removed'
    });
})();
