(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .constant('NST_NOTIFICATION_FACTORY_EVENT', {
      UPDATE: 'notifications-count-change',
      NEW_NOTIFICATION: 'new-notification',
      OPEN_INVITATION_MODAL: 'open-invitation-modal',
      OPEN_POST_VIEW: 'open-post-view',
      OPEN_PLACE: 'open-place',
      EXTERNAL_PUSH_ACTION: 'external-push-action'
    });
})();
