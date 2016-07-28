(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_TERM_COMPOSE_PREFIX', {
      FORWARD: 'Fwd: ',
      REPLY: 'Re: '
    });
})();
