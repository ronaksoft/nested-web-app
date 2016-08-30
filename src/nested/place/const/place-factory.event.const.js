(function() {
  'use strict';
  angular
    .module('nested')
    .constant('NST_PLACE_FACTORY_EVENT', {
      ROOT_ADD: 'root-add',
      SUB_ADD: 'sub-add',
      UPDATE : 'update',
      REMOVE: 'remove',
      PICTURE_CHANGE: 'pic-change',
      PRIVACY_CHANGE: 'privacy-change'
    });
})();
