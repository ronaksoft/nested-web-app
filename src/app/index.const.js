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
    .constant('NST_PATTERN', {
      GRAND_PLACE_ID: /^[a-zA-Z]\w{3,30}[a-zA-Z0-9]$/,
      SUB_PLACE_ID: /^[a-zA-Z]\w{1,30}[a-zA-Z0-9]$/,
      EMAIL: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
    });
})();
