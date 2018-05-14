(function () {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .constant('NST_POST_EVENT_ACTION', {
      SYNC_POST_ACTIVITY: 'post-activity',

      COMMENT_ADD: 0x002,
      COMMENT_REMOVE: 0x003,
      LABEL_ADD: 0x011,
      LABEL_REMOVE: 0x012,
      EDITED: 0x15,
      MOVE: 0x016,
      ATTACH: 0x017,

      INTERNAL_COMMENT_ADD: 'post-activity' + 0x002,
      INTERNAL_COMMENT_REMOVE: 'post-activity' + 0x003,
      INTERNAL_LABEL_ADD: 'post-activity' + 0x011,
      INTERNAL_LABEL_REMOVE: 'post-activity' + 0x012,
      INTERNAL_EDITED: 'post-activity' + 0x15,
      INTERNAL_MOVE: 'post-activity' + 0x016,
      INTERNAL_ATTACH: 'post-activity' + 0x017
    });
})();
