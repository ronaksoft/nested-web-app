'use strict';
angular
  .module('nested')
  .service('NstSvcNotification', NstSvcNotification);
/** @ngInject */
function NstSvcNotification($q, $window, _,
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
      $window.Notification.requestPermission(startNotification)
  };

  MyNotification.prototype.push = function (title, options) {
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    var opt = _.extend(this.options, options);
    if (!opt.tag)
      opt.tag = 'n_' + Date.now();

    var defer = $q.defer();

    var notificationObject = {
      title: title,
      options: opt,
      defer: defer
    };

    this.stack[opt.tag] =  notificationObject;
    this.show(opt.tag);
    return  notificationObject.defer.promise;
  };

  MyNotification.prototype.show = function (notificationTag) {
    var notifObject = this.stack[notificationTag];
    var notif = new $window.Notification(notifObject.title, notifObject.options);
    notif.onclick = function () {
      notifObject.defer.resolve();
    }

  };

  return new MyNotification();
}
