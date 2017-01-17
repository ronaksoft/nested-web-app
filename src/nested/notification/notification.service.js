'use strict';
angular
  .module('ronak.nested.web.components.notification')
  .service('NstSvcNotification', NstSvcNotification);
/** @ngInject */
function NstSvcNotification($q, $window, _,
                            NST_PERMISSION_NOTIFICATION,
                            NstObservableObject, NstSvcLogger, NstModel) {
  function MyNotification() {
    this.permission = Notification.permission;
    this.stack = {};
    this.options = {};
    NstModel.call(this);
  }


  MyNotification.prototype = new NstObservableObject();
  MyNotification.prototype.constructor = MyNotification;


  MyNotification.prototype.requestPermission = function () {
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    var service = this;

    function startNotification(result) {
      service.setPermission(result);
    }

    if (NST_PERMISSION_NOTIFICATION.GRANTED !== this.permission)
      $window.Notification.requestPermission(startNotification)
  };

  MyNotification.prototype.push = function (title, callback, options) {
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    var opt = _.extend(this.options, options);
    if (!opt.tag)
      opt.tag = 'n_' + Date.now();

    opt.icon = '/assets/images/nested-logo-256.png';
    var defer = $q.defer();

    var notificationObject = {
      title: title,
      options: opt,
      onclick: callback,
      defer: defer
    };

    this.stack[opt.tag] = notificationObject;
    this.show(opt.tag);
    return notificationObject.defer.promise;
  };

  MyNotification.prototype.show = function (notificationTag) {
    var notifObject = this.stack[notificationTag];
    var notif = new $window.Notification(notifObject.title, notifObject.options);
    notif.onclick = function () {
      window.focus();
      if (notifObject.onclick) notifObject.onclick();
      notif.close()
      notifObject.defer.resolve();
    }

  };


  return new MyNotification();
}
