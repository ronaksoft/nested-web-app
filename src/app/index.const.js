(function() {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .constant('NST_DEFAULT', {
      STATE: 'app.messages-favorites',
      STATE_PARAM: '_'
    })
    .constant('NST_PUBLIC_STATE', [
      'public.signin',
      'public.signin-back',
      'public.intro',
      'public.register',
      'public.register-with-phone',
      'public.recover'
    ])
    .constant('NST_PAGE', {
      'REGISTER': [
        'app.register',
        'app.register-with-phone'
      ],
      'RECOVER': [
        'app.recover'
      ],
      'SIGNIN': [
        'app.signin',
        'app.signin-back'
      ],
      'SIGNOUT': [
        'app.signout'
      ],
      'PROFILE': [
        'app.profile'
      ],
      'COMPOSE': [
        'app.compose',
        'app.place-compose',
        'app.compose-forward',
        'app.compose-reply-all',
        'app.compose-reply-sender'
      ],
      'PLACE_SETTINGS': [
        'app.place-settings'
      ],
      'PLACE_ADD': [
        'app.place-add'
      ],
      'POST': [
        'app.post'
      ],
      'ACTIVITY': [
        'app.activity',
        'app.activity-favorites',
        'app.activity-favorites-filtered',
        'app.activity-filtered',
        'app.place-activity',
        'app.place-activity-filtered'
      ],
      'MESSAGES': [
        'app.messages',
        'app.messages-favorites',
        'app.messages-favorites-sorted',
        'app.messages-sent',
        'app.messages-sent-sorted',
        'app.messages-spam',
        'app.messages-sorted',
        'app.place-messages',
        'app.place-messages-sorted',
        'app.place-message-chain',
        'app.message-chain'
      ],
      'FILES': [
        'app.place-files'
      ],
      'SEARCH': [
        'app.search'
      ]
    })
    .constant('NST_PATTERN', {
      // PASSWORD : /(?=.*[A-Z])(?=.*[a-z])(?=.*[\d~!@#\$%\^&\*\(\)\-_=\+\|\{\}\[\]\?\.])/,
      USERNAME : /^[a-zA-Z](?!.*([-_])\1{1})(?!.*-_)(?!.*_-)[a-zA-Z0-9-_]{3,30}[a-zA-Z0-9]$/,
      GRAND_PLACE_ID: /^[a-zA-Z](?!.*([-_])\1{1})(?!.*-_)(?!.*_-)[a-zA-Z0-9-_]{3,30}[a-zA-Z0-9]$/,
      COMPOSE_TARGET_ID: /^[a-zA-Z][a-zA-Z0-9-]{2,30}[a-zA-Z0-9]$/,
      SUB_PLACE_ID: /^[a-zA-Z](?!.*([-_])\1{1})(?!.*-_)(?!.*_-)[a-zA-Z0-9-_]{0,30}[a-zA-Z0-9]$/,
      EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    })
    .constant('NST_DELIMITERS', {
      PLACE_ID: '.'
    });
})();
