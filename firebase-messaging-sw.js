importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAS_4zDyNAMXGAF9tp-30QIp0ywRJhIjLc",
    authDomain: "gabinete-do-povo.firebaseapp.com",
    projectId: "gabinete-do-povo",
    storageBucket: "gabinete-do-povo.firebasestorage.app",
    messagingSenderId: "450444313568",
    appId: "1:450444313568:web:e12ba742d940dc23e52185"
  });
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const titulo = (payload.notification && payload.notification.title) || "Gabinete do Povo";
  const corpo = (payload.notification && payload.notification.body) || "Há novidades no aplicativo.";
  const link = (payload.data && payload.data.url) || "./app.html";

  self.registration.showNotification(titulo, {
    body: corpo,
    icon: "./iconeapp.jpg",
    badge: "./iconeapp.jpg",
    data: { url: link }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) || "./app.html";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(destino);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(destino);
      }
    })
  );
});
