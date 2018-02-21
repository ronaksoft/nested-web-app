(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstHook', NstHook);

  function NstHook() {
    Hook.prototype = {};
    Hook.prototype.constructor = Hook;

    function Hook() {
      this.id = undefined;
      this.name = undefined;
      this.eventType = undefined;
      this.url = undefined;
    }

    return Hook;
  }
})();
