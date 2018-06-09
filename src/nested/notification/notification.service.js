'use strict';
angular
  .module('ronak.nested.web.components.notification')
  .service('NstSvcNotification', NstSvcNotification);

/** @ngInject */
function NstSvcNotification($q, $window, _, $state, $rootScope,
                            NST_NOTIFICATION_TYPE, NST_AUTH_EVENT, NST_PLACE_EVENT_ACTION, NST_CONFIG,
                            NstObservableObject, NstSvcLogger, NstSvcTranslation, NstSvcAuth, NST_NOTIFICATION_EVENT,
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
    NstObservableObject.call(this);
  }


  MyNotification.prototype = new NstObservableObject();
  MyNotification.prototype.constructor = MyNotification;

  function loadScript(url) {
    var deferred = $q.defer();
    var script = document.createElement('script');
    script.setAttribute('src', url);
    script.async = true;
    document.head.appendChild(script);
    script.onload = function () {
      deferred.resolve();
    };
    return deferred.promise;
  }

//FIX Here
  MyNotification.prototype.requestPermission = function () {
    var service = this;
    if (!("Notification" in $window)) {
      NstSvcLogger.info(" Notification | This browser does not support desktop notification");
      return;
    }

    this.permission = $window.Notification.permission;

    if (NST_CONFIG.DISABLE_FCM !== 'true') {
      (function () {
        $q.all([
          loadScript('/firebase/firebase-app.js'),
          loadScript('/firebase/firebase-messaging.js')]).then(function () {
          console.log('firebasejs loaded');
          firebase.initializeApp(config);
          service.configFCM();
          $rootScope.$on(NST_AUTH_EVENT.AUTHORIZE, function () {
            service.configFCM();
          });
        });
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
      var data = event.data['firebase-messaging-msg-data'].data;
      if (data.type === 'n') {
        var subject = parseInt(data.subject);
        switch (subject) {
          case NST_NOTIFICATION_TYPE.COMMENT:
          case NST_NOTIFICATION_TYPE.MENTION:
            service.broadcastOpenPost(data.post_id, data.notification_id);
            break;
          case NST_NOTIFICATION_TYPE.PLACE_SETTINGS_CHANGED:
          case NST_NOTIFICATION_TYPE.DEMOTED:
          case NST_NOTIFICATION_TYPE.PROMOTED:
            service.broadcastOpenPlace(data.place_id, data.notification_id);
            break;
        }
      } else if (data.type === 'a') {
        var action = parseInt(data.action);
        switch (action) {
          case NST_PLACE_EVENT_ACTION.POST_ADD:
            service.broadcastOpenPost(data.post_id, data.notification_id);
        }
      } else if (data.type === 't') {
        var action = parseInt(data.action);
        switch (action) {
          case NST_PLACE_EVENT_ACTION.POST_ADD:
            service.broadcastOpenTask(data.task_id, data.notification_id);
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

  MyNotification.prototype.broadcastOpenTask = function (taskId, notificationId) {
    $rootScope.$broadcast(NST_NOTIFICATION_EVENT.EXTERNAL_PUSH_ACTION, {
      action: NST_NOTIFICATION_EVENT.OPEN_TASK,
      taskId: taskId,
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
    }
  }


  return new MyNotification();
}
