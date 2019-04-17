(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .constant('NST_SEARCH_QUERY_PREFIX', {
      USER: '@',
      PLACE: '#',
      KEYWORD: 'keyword',
      NEW_USER: 'from:',
      NEW_PLACE: 'in:',
      NEW_LABEL: 'label:',
      NEW_TO: 'to:',
      APP: 'app:',
      NEW_USER_FA: 'از:',
      NEW_PLACE_FA: 'در:',
      NEW_LABEL_FA: 'برچسب:',
      NEW_TO_FA: 'به:',
      APP_FA: 'app:',
      SUBJECT: 'subject:',
      ATTACHMENT: 'attachment:',
      WITHIN: 'within:',
      EMOJI: ':',
      DATE: 'date:'
    });
})();
