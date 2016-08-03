(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_PLACE_MEMBER_TYPE', {
      KEY_HOLDER: 'key_holder',
      KNOWN_GUEST: 'known_guest',
      CREATOR: 'creator'
    })
})();
