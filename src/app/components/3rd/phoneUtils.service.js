(function() {
  'use strict';
  angular
    .module('phoneUtils', [])
    .service('phoneUtils', phoneUtils );
  function phoneUtils() {
    return window.libphonenumber.PhoneNumberUtil.getInstance();
  }
})();
