(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .constant('NST_PLACE_POLICY_OPTION', {
      MANAGERS: 0,
      MEMBERS: 1,
      TEAMMATES: 2,
      EVERYONE: 3
    });
})();
