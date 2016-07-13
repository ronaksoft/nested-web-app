(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_PLACE_ACCESS', {
      READ: 'RD',
      WRITE: 'WR',
      READ_POST: 'RD',
      WRITE_POST: 'WR',
      REMOVE_POST: 'D',
      CONTROL: 'C',
      ADD_MEMBERS: 'AM',
      REMOVE_MEMBERS: 'RM',
      SEE_MEMBERS: 'SM',
      REMOVE_PLACE: 'RP',
      ADD_PLACE: 'AP',
      GUEST: 'G'
    })
    .constant('NST_PLACE_MEMBER_TYPE', {
      KEY_HOLDER: 'key_holder',
      KNOWN_GUEST: 'known_guest',
      CREATOR: 'creator'
    })
})();
