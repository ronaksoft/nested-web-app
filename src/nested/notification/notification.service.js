'use strict';
angular
  .module('ronak.nested.web.components.notification')
  .service('NstSvcNotification', NstSvcNotification);
/** @ngInject */
function NstSvcNotification($q, $window, _, $state,
                            NST_NOTIFICATION_FACTORY_EVENT, NST_NOTIFICATION_TYPE, NST_AUTH_EVENT, NST_EVENT_ACTION,
                            NstObservableObject, NstSvcLogger, NstModel, NstSvcTranslation, NstSvcAuth, NstFactoryEventData,
                            NstUtility) {


  var config = {
    apiKey: "AIzaSyCkoYUKPeOpBjpQVLVg7sbRdyb0_Qk_cK4",
    authDomain: "nested-me.firebaseapp.com",
    databaseURL: "https://nested-me.firebaseio.com",
    storageBucket: "nested-me.appspot.com",
    messagingSenderId: "993735378969"

  };


  function MyNotification() {
    this.stack = {};
    this.options = {};
    NstModel.call(this);

    NstSvcAuth.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      this.options = {};
      this.stack = {};
    })

  }


  MyNotification.prototype = new NstObservableObject();
  MyNotification.prototype.constructor = MyNotification;

//FIX Here
  MyNotification.prototype.requestPermission = function () {
    var service = this;
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    this.permission = $window.Notification.permission;

    firebase.initializeApp(config);

    this.configFCM();
    NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function () {
      service.configFCM();
    })

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

    var dt = "";
    var messaging = firebase.messaging();


    messaging.requestPermission()
      .then(function () {
        NstSvcLogger.debug("Notification | has permission!");
        return messaging.getToken();
      })
      .then(function (token) {
        dt = token;
        NstSvcLogger.debug("Notification | ", token);
        NstSvcAuth.setDeviceToken(token);
      }).catch(function (err) {
      NstSvcLogger.debug("Notification | Error get token:", err);
    });

    messaging.onTokenRefresh(function () {
      messaging.getToken()
        .then(function (refreshedToken) {
          dt = refreshedToken;
          NstSvcLogger.debug("Notification Token Refreshed | ", refreshedToken);
          NstSvcAuth.setDeviceToken(refreshedToken);
        })
        .catch(function (err) {
          NstSvcLogger.debug("Notification Unable to retrieve refreshed token | ", err);
        });
    });


    this.registerBroadcastReceiver();

    messaging.onMessage(function (payload) {
      NstSvcLogger.debug("Notification  | ", payload);
    });

    NstSvcAuth.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      messaging.deleteToken(dt)
    })

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

  MyNotification.prototype.registerBroadcastReceiver = function () {
    var service = this;
    navigator.serviceWorker.onmessage = function (event) {

      var data = event.data;
      if (data.command == "broadcastOnNotificationClick") {
        var body = JSON.parse(data.message);

        if (body.payload.type === "n") {
          var subject = parseInt(body.payload.subject);
          switch (subject) {
            case NST_NOTIFICATION_TYPE.COMMENT:
            case NST_NOTIFICATION_TYPE.MENTION:
              service.broadcastOpenPost(body.payload.post_id, body.payload.notification_id);
              break;
            case NST_NOTIFICATION_TYPE.PLACE_SETTINGS_CHANGED:
            case NST_NOTIFICATION_TYPE.DEMOTED:
            case NST_NOTIFICATION_TYPE.PROMOTED:
              service.broadcastOpenPlace(body.payload.place_id, body.payload.notification_id);
              break;
            case NST_NOTIFICATION_TYPE.INVITE:
              break;
          }
        }
        if (body.payload.type === "a") {
          var action = parseInt(body.payload.action);
          switch (action) {
            case NST_EVENT_ACTION.POST_ADD:
              service.broadcastOpenPost(body.payload.post_id, body.payload.notification_id);
          }
        }
      }
    };
  };

  MyNotification.prototype.broadcastOpenPost = function (postId, notificationId) {
    this.dispatchEvent(new CustomEvent(NST_NOTIFICATION_FACTORY_EVENT.EXTERNAL_PUSH_ACTION, new NstFactoryEventData({
      action: NST_NOTIFICATION_FACTORY_EVENT.OPEN_POST_VIEW,
      postId: postId,
      notificationId: notificationId
    })))
  };

  MyNotification.prototype.broadcastOpenPlace = function (placeId, notificationId) {
    this.dispatchEvent(new CustomEvent(NST_NOTIFICATION_FACTORY_EVENT.EXTERNAL_PUSH_ACTION, new NstFactoryEventData({
      action: NST_NOTIFICATION_FACTORY_EVENT.OPEN_PLACE,
      placeId: placeId,
      notificationId: notificationId
    })));
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
