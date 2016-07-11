(function() {
  'use strict';

  angular
    .module('nested')
    .constant('ACTIVITY_FILTERS', {
          ALL : 0,
      MESSAGE : 1,
      COMMENT : 2,
          LOG : 3
    });

})();
