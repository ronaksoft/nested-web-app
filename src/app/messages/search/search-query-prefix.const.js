(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .constant('NST_SEARCH_QUERY_PREFIX', {
      USER: '@',
      PLACE: '#',
      NEW_USER: 'from:',
      NEW_PLACE: 'in:',
      NEW_LABEL: 'label:',
      NEW_METHOD_KEY: '::new_method::'
    });
})();
