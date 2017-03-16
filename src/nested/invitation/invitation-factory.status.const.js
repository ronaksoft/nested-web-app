(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .constant('NST_INVITATION_FACTORY_STATE', {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      DECLINED: 'declined'
    });
})();
