(function () {

  'use strict';
  angular.module('ronak.nested.web.common').constant('NST_REQ_STATUS', {
    NOT_SENT: 'not_sent',
    QUEUED: 'queued',
    SENT: 'sent',
    CANCELLED: 'cancelled',
    RESPONDED: 'responded'
  });
})();
