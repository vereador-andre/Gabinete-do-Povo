const CACHE_NAME = "gabinete-do-povo-v1";
const URLS_CACHE = [
  "./",
  "./index.html",
  "./app.html",
  "./manifest.json",
  "./iconeapp.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_CACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  let dados = {
    title: "Gabinete do Povo",
    body: "Há novidades no aplicativo de André de Dedé.",
    url: "./app.html"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      dados = { ...dados, ...parsed, ...(parsed.notification || {}) };
    } catch (e) {
      dados.body = event.data.text() || dados.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(dados.title, {
      body: dados.body,
      icon: "./iconeapp.jpg",
      badge: "./iconeapp.jpg",
      data: { url: dados.url || "./app.html" }
    })
  );
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
