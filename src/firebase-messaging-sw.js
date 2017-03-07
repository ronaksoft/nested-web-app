importScripts('https://www.gstatic.com/firebasejs/3.6.10/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.6.10/firebase-messaging.js');

var notifs = {};

var config = {
  apiKey: "AIzaSyCkoYUKPeOpBjpQVLVg7sbRdyb0_Qk_cK4",
  authDomain: "nested-me.firebaseapp.com",
  databaseURL: "https://nested-me.firebaseio.com",
  storageBucket: "nested-me.appspot.com",
  messagingSenderId: "993735378969"
};

firebase.initializeApp(config);

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {

  var options = {
    body: payload.data.msg,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    icon: '/assets/images/nested-logo-256.png',
    payload: payload.data,
    tag: Date.now()
  };

  notifs[options.tag] = options;

  return self.registration.showNotification('Nested', options);

});

self.addEventListener("notificationclick", function (event) {

  // close the notification
  event.notification.close();

  //To open the app after click notification
  event.waitUntil(
    clients.matchAll({includeUncontrolled: true, type: 'window'})
      .then(function (clientList) {

        if (!notifs[event.notification.tag]) return;

        var targetUrl = '/';
        if (notifs[event.notification.tag].payload.post_id) {
          targetUrl = '/#/message/' + notifs[event.notification.tag].payload.post_id;
        }


        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if ("focus" in client) {
            client.focus();
            client.postMessage({
              "command": "broadcastOnNotificationClick",
              "message": JSON.stringify(notifs[event.notification.tag])
            });
            return;
          }
        }

        if (clientList.length === 0) {
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        }
      })
  );
});
