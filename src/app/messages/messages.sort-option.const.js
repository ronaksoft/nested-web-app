(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_MESSAGES_SORT_OPTION', {
      LATEST_MESSAGES : 'latest-messages',
      LATEST_ACTIVITY : 'latest-activity'
    });

})();
