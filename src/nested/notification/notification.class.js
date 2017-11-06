(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.notification')
    .factory('NstNotification', NstNotification);

  function NstNotification() {

    function Notification() {

      this.id = null;
      this.isSeen = false;
      this.type = null;
      this.actor = null;
      this.date = null;
      this.isTask = false;
    }

    Notification.prototype = {};
    Notification.prototype.constructor = Notification;

    return Notification;
  }

})();
