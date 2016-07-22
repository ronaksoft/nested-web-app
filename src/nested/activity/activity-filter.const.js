(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_ACTIVITY_FILTER', {
          ALL : 0,
      MESSAGE : 1,
      COMMENT : 2,
          LOG : 3
    });
})();
