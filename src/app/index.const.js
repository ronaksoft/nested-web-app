/* global moment:false */
(function() {
  'use strict';

  angular
    .module('nested')
    .constant('moment', moment)
    .constant('NST_DEFAULT', {
      STATE: 'messages',
      STATE_PARAM: '_'
    })
    .constant('NST_PUBLIC_STATE', [
      'signin',
      'signin-back',
      'intro',
      'register'
    ])
    .constant('NST_PAGE', {
      'INTRO': [
        'intro'
      ],
      'REGISTER': [
        'register'
      ],
      'SIGNIN': [
        'signin',
        'signin-back'
      ],
      'SIGNOUT': [
        'signout'
      ],
      'PROFILE': [
        'profile'
      ],
      'COMPOSE': [
        'compose',
        'place-compose',
        'compose-forward',
        'compose-reply-all',
        'compose-reply-sender'
      ],
      'PLACE_SETTINGS': [
        'place-settings'
      ],
      'PLACE_ADD': [
        'place-add'
      ],
      'POST': [
        'post'
      ],
      'ACTIVITY': [
        'activity',
        'activity-bookmarks',
        'activity-bookmarks-filtered',
        'activity-filtered',
        'place-activity',
        'place-activity-filtered'
      ],
      'MESSAGES': [
        'messages',
        'messages-bookmarks',
        'messages-bookmarks-sorted',
        'messages-sent',
        'messages-sent-sorted',
        'messages-sorted',
        'place-messages',
        'place-messages-sorted'
      ],
      'SEARCH': [
        'search'
      ]
    })
    .constant('NST_PATTERN', {
      GRAND_PLACE_ID: /^[a-zA-Z]\w{3,30}[a-zA-Z0-9]$/,
      SUB_PLACE_ID: /^[a-zA-Z]\w{1,30}[a-zA-Z0-9]$/,
      EMAIL: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
    })
    .constant('NST_DELIMITERS', {
      PLACE_ID: '.'
    });
})();
