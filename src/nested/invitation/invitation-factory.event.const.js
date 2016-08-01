(function() {
  'use strict';
  angular
    .module('nested')
    .constant('NST_INVITATION_FACTORY_EVENT', {
      ACCEPT: 'accept',
      DECLINE: 'decline'
    });
})();
