(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstReminderRequest', NstReminderRequest);

  /** @ngInject */
  function NstReminderRequest() {
    function ReminderRequest() {
      this.id = undefined;

      this.reminder = {};

      this.user = {};
    }

    ReminderRequest.prototype = {};
    ReminderRequest.prototype.constructor = ReminderRequest;

    return ReminderRequest;
  }
})();
