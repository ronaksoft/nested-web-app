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
      PLACE_MOVE: 0x016,
      PLACE_ATTACH: 0x017
    });
})();
