(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .constant('NST_PLACE_FACTORY_EVENT', {
      ROOT_ADD: 'root-add',
      SUB_ADD: 'sub-add',
      UPDATE : 'update',
      REMOVE: 'remove',
      PICTURE_CHANGE: 'pic-change',
      PRIVACY_CHANGE: 'privacy-change',
      BOOKMARK_ADD: 'BOOKMARK_ADD',
      BOOKMARK_REMOVE: 'BOOKMARK_REMOVE',
      NOTIFICATION_ON: 'NOTIFICATION_ON',
      NOTIFICATION_OFF: 'NOTIFICATION_OFF',
      ADD_MEMBER: 'ADD_MEMBER',
      REMOVE_MEMBER: 'REMOVE_MEMBER'
    });
})();
