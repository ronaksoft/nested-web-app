(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_SEARCH_QUERY_PREFIX', {
      USER: '@',
      PLACE: '#'
    });
})();
