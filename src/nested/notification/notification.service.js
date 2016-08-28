(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcNotification', NstSvcNotification);

  /** @ngInject */
  function NstSvcNotification($q, _,
                              NST_PERMISSION_NOTIFICATION,
                              NstObservableObject, NstSvcLogger) {
    function MyNotification() {
      this.permission = Notification.permission;
      this.stack = {};
      this.options = {};
    }

    MyNotification.prototype = {};
    MyNotification.prototype = new NstObservableObject();
    MyNotification.prototype.constructor = MyNotification;


    MyNotification.prototype.requestPermission = function () {
      var service = this;

      function startNotification(result) {
        service.setPermission(result);
        if (result == NST_PERMISSION_NOTIFICATION.GRANTED){

        }
      }

      if (NST_PERMISSION_NOTIFICATION.GRANTED !== this.permission)
        Notification.requestPermission(startNotification)
    };

    MyNotification.prototype.push = function (title, options) {
      if (!("Notification" in window)) {
        NstSvcLogger.info(" Notification | This browser does not support desktop notification");
        return;
      }
      if (!options.tag)
        options.tag = 'n_' + Date.now();


      var opt = _.extend(this.options, options);
      var notification_object = {
        title: title,
        option: opt,
        q: $q.defer()
      };

      this.stack[options.tag] = notification_object;

      return notification_object.q;
    };

    MyNotification.prototype.show = function (notificationTag) {
      var notif_object = this.stack[notificationTag];
      var notif = new Notification(notif_object.title, notif_object.options);
      notif.onClick(notif_object.q.resolve);

    };

    return new MyNotification();
  }
});
