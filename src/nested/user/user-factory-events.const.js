(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_USER_EVENT', {
      PICTURE_UPDATED : 'user-picture-updated',
      PICTURE_REMOVED : 'user-picture-removed',
      PROFILE_UPDATED : 'user-profile-updated'
    });
})();
