(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .constant('NST_NOTIFICATION_EVENT', {
      UPDATE: 'notification-count-change',
      NEW_NOTIFICATION: 'notification-new',
      OPEN_INVITATION_MODAL: 'notification-invitation-view',
      OPEN_POST_VIEW: 'notification-post-view',
      OPEN_PLACE: 'notification-place-view',
      EXTERNAL_PUSH_ACTION: 'notification-external-push-action'
    });
})();
