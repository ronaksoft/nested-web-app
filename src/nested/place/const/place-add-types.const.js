(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .constant('NST_PLACE_ADD_TYPES', {
      ADD_GRAND_PLACE: 'add_grand_place',
      ADD_LOCKED_PLACE: 'add_locked_place',
      ADD_UNLOCKED_PLACE : 'add_unlocked_place'
    })
})();
