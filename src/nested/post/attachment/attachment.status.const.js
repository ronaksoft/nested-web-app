(function () {

  'use strict';
  angular.module('nested').constant('NST_ATTACHMENT_STATUS', {
    UNKNOWN: 'unknown',
    UPLOADING: 'uploading',
    ATTACHED: 'attached',
    ABORTED: 'aborted'
  });
})();
