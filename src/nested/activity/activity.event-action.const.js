(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .constant('NST_PLACE_EVENT_ACTION', {
      MEMBER_REMOVE: 0x002,
      MEMBER_JOIN: 0x008,
      PLACE_ADD: 0x010,
      POST_ADD: 0x100,
      POST_ATTACH_PLACE: 0x104,
      POST_REMOVE_PLACE: 0x105,
      POST_MOVE_TO: 0x106,
      POST_MOVE_FROM: 0x107
    });
})();
