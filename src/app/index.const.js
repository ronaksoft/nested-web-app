/* global moment:false */
(function() {
  'use strict';

  angular
    .module('nested')
    .constant('moment', moment)
    .constant('NST_DEFAULT', {
      STATE: 'messages'
    })
    .constant('NST_PATTERN', {
      GRAND_PLACE_ID: /^[a-zA-Z]\w{3,30}[a-zA-Z0-9]$/,
      SUB_PLACE_ID: /^[a-zA-Z]\w{1,30}[a-zA-Z0-9]$/
    });
})();
