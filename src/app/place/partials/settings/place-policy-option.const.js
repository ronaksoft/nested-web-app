(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .constant('NST_PLACE_POLICY_OPTION', {
      MANAGERS: 'creators',
      MEMBERS: 'key_holders',
      TEAMMATES: 'teammates',
      EVERYONE: 'everyone'
    });
})();
