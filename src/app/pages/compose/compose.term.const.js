(function() {
  'use strict';

  angular
    .module('ronak.nested.web.messages')
    .constant('NST_TERM_COMPOSE_PREFIX', {
      FORWARD: 'Fwd: ',
      REPLY: 'Re: '
    });
})();
