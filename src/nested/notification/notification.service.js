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
      if (result == NST_PERMISSION_NOTIFICATION.GRANTED) {

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

    var opt = _.extend(this.options, options);
    if (!opt.tag)
      opt.tag = 'n_' + Date.now();

    var defer = $q.defer();

    var notification_object = {
      title: title,
      options: opt,
      q: defer.promise
    };

    this.stack[opt.tag] = notification_object;
    this.show(opt.tag);
    return notification_object.q;
  };

  MyNotification.prototype.show = function (notificationTag) {
    var notif_object = this.stack[notificationTag];

    console.log(notif_object);

    var notif = new Notification(notif_object.title, notif_object.options);
    notif.onclick = notif_object.q.resolve(notif);

  };

  return new MyNotification();
}
