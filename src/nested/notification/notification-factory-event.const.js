(function() {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .constant('NST_NOTIFICATION_FACTORY_EVENT', {
      UPDATE: 'notifications-count-change',
      NEW_NOTIFICATION: 'new-notification'
    });
})();
