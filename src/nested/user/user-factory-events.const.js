(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_USER_FACTORY_EVENT', {
      PICTURE_UPDATED : 'picture_updated',
      PICTURE_REMOVED : 'picture_removed',
      PROFILE_UPDATED : 'profile_updated'
    });
})();
