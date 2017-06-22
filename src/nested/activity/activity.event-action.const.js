(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .constant('NST_EVENT_ACTION', {
      // MEMBER
      MEMBER_REMOVE: 2,
      MEMBER_JOIN: 8,
      // PLACE
      PLACE_ADD: 16,
      // POST
      POST_ADD: 256,
      POST_COPY: 257,
      POST_RETRACT: 258,
      POST_UPDATE: 259,
      POST_ATTACH_PLACE: 260,
      POST_REMOVE_PLACE: 261,
      POST_MOVE: 262,
      // COMMENT
      COMMENT_ADD: 2048,
      COMMENT_REMOVE: 2049
    });
})();
