// public/firebase-messaging-sw.js
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
);
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
);

// These will be replaced at build time by inject script
const firebaseConfig = {
  apiKey: "AIzaSyCE-C7sweNG4sX_uXXtke9f4IGGoPshrNY",
  authDomain: "groundgame26.firebaseapp.com",
  projectId: "groundgame26",
  storageBucket: "groundgame26.appspot.com",
  messagingSenderId: "707878592124",
  appId: "1:707878592124:web:73464af30f8573639773f9",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("Background Message:", payload);

  const title = payload.notification?.title || "GroundGame26";
  const options = {
    body: payload.notification?.body || "You have a new message",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "groundgame-notification",
  };

  self.registration.showNotification(title, options);
});
