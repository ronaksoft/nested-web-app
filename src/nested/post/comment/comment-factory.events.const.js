(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_COMMENT_FACTORY_EVENT', {
      ADD: 'post-comment-added',
      REMOVE: 'post-comment-removed'
    });
})();
