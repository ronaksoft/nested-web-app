(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .constant('NST_INVITATION_EVENT', {
      ADD: 'invitation-add',
      ACCEPT: 'invitation-accept',
      DECLINE: 'invitation-decline'
    });
})();
