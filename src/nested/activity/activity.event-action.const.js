(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .constant('NST_EVENT_ACTION', {
      MEMBER_ADD: 1,
      MEMBER_REMOVE: 2,
      MEMBER_INVITE: 4,
      MEMBER_JOIN: 8,

      PLACE_ADD: 16,
      PLACE_REMOVE: 32,
      PLACE_PRIVACY: 64,
      PLACE_PICTURE: 128,

      POST_ADD: 256,
      POST_REMOVE: 512,
      POST_UPDATE: 1024,

      COMMENT_ADD: 2048,
      COMMENT_REMOVE: 3840,

      MENTION_ADD : 2049,

      ACCOUNT_REGISTER: 4096,
      ACCOUNT_LOGIN: 8192,
      ACCOUNT_PICTURE: 16384
    });
})();
