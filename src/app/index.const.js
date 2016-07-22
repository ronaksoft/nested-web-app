/* global moment:false */
(function() {
  'use strict';

  angular
    .module('nested')
    .constant('moment', moment)
    .constant('NST_DEFAULT', {
      STATE: 'messages'
    });

})();
