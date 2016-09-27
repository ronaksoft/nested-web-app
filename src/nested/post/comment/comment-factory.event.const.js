(function() {
  'use strict';

  angular
    .module('ronak.nested.web.comment')
    .constant('NST_COMMENT_EVENT', {
      ADD: 'post-comment-added',
      REMOVE: 'post-comment-removed'
    });
})();
