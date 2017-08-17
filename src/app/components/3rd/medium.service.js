(function() {
  'use strict';
  angular
    .module('medium', [])
    .service('Medium', Medium );
  function Medium() {
    return window.Medium;
  }
})();
