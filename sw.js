// Service Worker بسيط لدعم إشعارات النظام (showNotification) في برنامج التوصيل.
// لازم يكون في نفس مجلد index.html بالظبط، وبنفس الاسم "sw.js".

const CACHE_NAME = "delivery-app-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// لازم نستقبل حدث "fetch" حتى لو مش بنعمل كاش فعلي،
// لأن المتصفح مش بيعتبر الـ Service Worker "نشط بالكامل"
// من غير ما يكون فيه fetch handler.
self.addEventListener("fetch", (event) => {
  // نمرر الطلب زي ما هو من غير أي تعديل (بدون كاش أوفلاين حاليًا).
  event.respondWith(fetch(event.request));
});

// لو حد ضغط على إشعار النظام، نفتح/نركّز على تاب البرنامج.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
