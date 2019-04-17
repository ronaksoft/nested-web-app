(function() {
  'use strict';
  angular
    .module('firebase', [])
    .service('firebase', firebase );
  function firebase() {
    return window.firebase;
  }
})();
