/* global moment:false */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .constant('NST_PLACE_EVENT', {
      REMOVED: 'place-removed',
      UPDATED: 'place-updated',
      PICTURE_CHANGED: 'place-picture-changed',
      ROOT_ADDED: 'place-root-added',
      SUB_ADDED: 'place-sub-added',
      NOTIFICATION: 'place-notification'
    });
})();
