importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAFQmbIyEr9gj2NiyWlMoAzHKRq5t5Qb_Q",
  authDomain: "whispr-9b96c.firebaseapp.com",
  projectId: "whispr-9b96c",
  storageBucket: "whispr-9b96c.firebasestorage.app",
  messagingSenderId: "1020214174524",
  appId: "1:1020214174524:web:12d14c3a72940b0f877439",
});

firebase.messaging();


self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.FCM_MSG?.data?.url ||
    event.notification.data?.url ||
    "/";

  event.waitUntil(clients.openWindow(url));
});
