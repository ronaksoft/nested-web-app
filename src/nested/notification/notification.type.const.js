(function () {

  'use strict';
  angular.module('ronak.nested.web.components.notification').constant('NST_NOTIFICATION_TYPE', {
    MENTION: 0x001,

    COMMENT: 0x002,

    INVITE: 0x003,
    INVITE_RESPOND: 0x004,

    YOU_JOINED: 0x005,

    PROMOTED: 0x006,
    DEMOTED: 0x007,

    PLACE_SETTINGS_CHANGED :  0x008,

    FRIEND_JOINED: 0x010,

    TASK_OVERDUE: 0x100,
    TASK_NOT_ASSIGNED: 0x200

  });
})();
