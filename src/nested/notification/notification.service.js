'use strict';
angular
  .module('ronak.nested.web.components.notification')
  .service('NstSvcNotification', NstSvcNotification);
/** @ngInject */
function NstSvcNotification($q, $window, _, $state,
                            NST_PERMISSION_NOTIFICATION, NST_NOTIFICATION_TYPE,
                            NstObservableObject, NstSvcLogger, NstModel, NstSvcTranslation,
                            NstUtility) {
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
      service.push('Nested Now on your desktop!', null, {body: 'Stay connected to what happen in your Nested.'});
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


  MyNotification.prototype.push2 = function (notificationObject, options) {
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }


    var opt = _.extend(this.options, options);
    if (!opt.tag)
      opt.tag = 'n_' + Date.now();

    opt.icon = opt.icon || '/assets/images/nested-logo-256.png';


    notificationObject.defer = $q.defer();
    this.stack[opt.tag] = parseNotification(notificationObject);
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


  function parseNotification(notificationObject) {
    switch (notificationObject.type) {
      case NST_NOTIFICATION_TYPE.MENTION :
        return {
          title: 'Mentioned in post by ' + notificationObject.sender.fullName,
          onclick: function () {
            $state.go('app.message', {postId: notificationObject.postId});
          },
          options: {
            body: notificationObject.comment.body
          }
        };
      case NST_NOTIFICATION_TYPE.INVITE :
        alert(86);
        return {
          title: NstUtility.string.format(
            NstSvcTranslation.get("Invitation to {0}"),
            notificationObject.place.name),
          onclick: function () {
            // $state.go('app.message', {postId: notificationObject.postId});
          },
          options: {
            body: NstUtility.string.format(
              NstSvcTranslation.get("by {0}"),
              notificationObject.inviter.fullName)
          }
        }
    }
  }


  return new MyNotification();
}
