'use strict';
angular
  .module('ronak.nested.web.components.notification')
  .service('NstSvcNotification', NstSvcNotification);
/** @ngInject */
function NstSvcNotification($q, $window, _, $state,
                            NST_PERMISSION_NOTIFICATION, NST_NOTIFICATION_TYPE,
                            NstObservableObject, NstSvcLogger, NstModel, NstSvcTranslation, NstSvcAuth,
                            NstUtility) {


  function MyNotification() {
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
    this.permission = $window.Notification.permission;

    function startNotification(result) {
      service.push('Nested Now on your desktop!', null, {body: 'Stay connected to what happen in your Nested.'});
    }

    // if (NST_PERMISSION_NOTIFICATION.GRANTED !== this.permission){
    //   $window.Notification.requestPermission(startNotification)
    // }else{
      this.configFCM();
      //register web worker
      // this.registerServiceWorker();
    // }

  };

  MyNotification.prototype.registerServiceWorker = function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function (registration) {
          NstSvcLogger.info(" Notification | Messaging service notification registered.");
        }).catch(function (err) {
        NstSvcLogger.info(" Notification | Messaging service notification registered.", err);
      })
    }

  };


  MyNotification.prototype.configFCM = function () {
    var config = {
      apiKey: "AIzaSyCkoYUKPeOpBjpQVLVg7sbRdyb0_Qk_cK4",
      authDomain: "nested-me.firebaseapp.com",
      databaseURL: "https://nested-me.firebaseio.com",
      storageBucket: "nested-me.appspot.com",
      messagingSenderId: "993735378969"

    };


    firebase.initializeApp(config);

    var messaging = firebase.messaging();
    messaging.requestPermission()
      .then(function () {
        NstSvcLogger.debug("Notification | has permission!");
        return messaging.getToken();
      })
      .then(function (token) {
        NstSvcLogger.debug("Notification | ", token);
        NstSvcAuth.setDeviceToken(token);
      }).catch(function (err) {
      NstSvcLogger.debug("Notification | Error get token:", err);
      });

    messaging.onMessage(function (payload) {
      NstSvcLogger.debug("Notification  | ", payload);
    });

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
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    var notifObject = this.stack[notificationTag];
    var notif = new $window.Notification(notifObject.title, notifObject.options);
    notif.onclick = function () {
      window.focus();
      if (notifObject.onclick) notifObject.onclick();
      notif.close();
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
