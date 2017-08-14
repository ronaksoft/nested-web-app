'use strict';
angular
  .module('ronak.nested.web.components.notification')
  .service('NstSvcNotification', NstSvcNotification);

/** @ngInject */
function NstSvcNotification($q, $window, _, $state, $rootScope,
                            NST_NOTIFICATION_TYPE, NST_AUTH_EVENT, NST_EVENT_ACTION, NST_CONFIG,
                            NstObservableObject, NstSvcLogger, NstModel, NstSvcTranslation, NstSvcAuth, NstFactoryEventData,
                            NstUtility, NstSvcDate) {


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


    if (!NST_CONFIG.DISABLE_FCM) {
      (function () {
        var fcm_app_script = document.createElement('script');
        fcm_app_script.setAttribute('src', 'http://www.gstatic.com/firebasejs/3.6.10/firebase-app.js');
        fcm_app_script.async = true
        document.head.appendChild(fcm_app_script);

        var fcm_messaging_script = document.createElement('script');
        fcm_messaging_script.setAttribute('src', 'https://www.gstatic.com/firebasejs/3.6.10/firebase-messaging.js');
        fcm_messaging_script.async = true

        fcm_messaging_script.onload = function () {
          firebase.initializeApp(config);
          service.configFCM();
          $rootScope.$on(NST_AUTH_EVENT.AUTHORIZE, function () {
            service.configFCM();
          });

        };
        document.head.appendChild(fcm_messaging_script);
      })();

    }

  };

  MyNotification.prototype.registerServiceWorker = function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function () {
          NstSvcLogger.info(" Notification | Messaging service notification registered.");
        }).catch(function (err) {
        NstSvcLogger.info(" Notification | Messaging service notification registered.", err);
      })
    }

  };


  MyNotification.prototype.configFCM = function () {
    var that = this;
    if (!("Notification" in $window)) {
      return;
    }
    var dt = "";
    try {
      var messaging = firebase.messaging();


      messaging.requestPermission()
        .then(function () {
          NstSvcLogger.debug("Notification | has permission!");
          return messaging.getToken();
        })
        .then(function (token) {
          dt = token;
          NstSvcLogger.debug("Notification | ", token);
          that.registerServiceWorker();
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
      // TODO: Move this to costructor. Because every method call adds a new listener
      $rootScope.$on(NST_AUTH_EVENT.UNAUTHORIZE, function () {
        messaging.deleteToken(dt)
        that.options = {};
        that.stack = {};
      });
    } catch (error) {
      NstSvcLogger.error('Notification : Error in register fmc', error);
    }
  };


  MyNotification.prototype.push = function (title, callback, options) {
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    var opt = _.extend(this.options, options);
    if (!opt.tag)
      opt.tag = 'n_' + NstSvcDate.now();

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
      opt.tag = 'n_' + NstSvcDate.now();

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
    if (!("serviceWorker" in navigator)) {
      return;
    }
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
    $rootScope.$broadcast(NST_NOTIFICATION_EVENT.EXTERNAL_PUSH_ACTION, {
      action: NST_NOTIFICATION_EVENT.OPEN_POST_VIEW,
      postId: postId,
      notificationId: notificationId
    });
  };

  MyNotification.prototype.broadcastOpenPlace = function (placeId, notificationId) {
    $rootScope.$broadcast(NST_NOTIFICATION_EVENT.EXTERNAL_PUSH_ACTION, {
      action: NST_NOTIFICATION_EVENT.OPEN_PLACE,
      placeId: placeId,
      notificationId: notificationId
    });
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
