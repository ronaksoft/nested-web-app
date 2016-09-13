(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .constant('NST_PLACE_MEMBER_TYPE', {
      CREATOR: 'creator',
      KEY_HOLDER: 'key_holder',
      KNOWN_GUEST: 'known_guest',
      NON_MEMBER: 'non_member'
    })
})();
