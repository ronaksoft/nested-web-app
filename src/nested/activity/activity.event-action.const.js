(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .constant('NST_PLACE_EVENT_ACTION', {
      MEMBER_REMOVE: 0x002,
      MEMBER_JOIN: 0x008,
      PLACE_ADD: 0x010,
      POST_ADD: 0x100,
      POST_ATTACH_PLACE: 260,
      POST_REMOVE_PLACE: 261,
      POST_MOVE: 262,
      // COMMENT
      COMMENT_ADD: 2048,
      COMMENT_REMOVE: 2049,
      // LABEL
      LABEL_ADD: 263,
      LABEL_REMOVE: 264
    });
})();
