(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
