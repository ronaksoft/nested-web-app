(function() {
  'use strict';
  angular
    .module('nested')
    .constant('NST_INVITATION_FACTORY_EVENT', {
      ADD: 'add',
      ACCEPT: 'accept',
      DECLINE: 'decline'
    });
})();
