importScripts('https://www.gstatic.com/firebasejs/3.6.10/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.6.10/firebase-messaging.js');


var config = {
  apiKey: "AIzaSyAV1kvQcPvWr0umT4b_ScXxbBEHPxRF28g",
  authDomain: "intense-fire-2497.firebaseapp.com",
  databaseURL: "https://intense-fire-2497.firebaseio.com",
  storageBucket: "intense-fire-2497.appspot.com",
  messagingSenderId: "285779166680"

};

firebase.initializeApp(config);

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  return self.registration.showNotification('OOO','ooo');
});
