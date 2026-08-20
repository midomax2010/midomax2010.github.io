// Service Worker — يدعم إشعارات Push حقيقية توصل حتى لو البرنامج مقفول خالص.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// أهم جزء: استقبال إشعار Push من السيرفر (Supabase Edge Function) وعرضه
// كإشعار نظام حتى لو التاب/البرنامج مقفول خالص، طالما المتصفح شغّال
// في الخلفية أو الجهاز بيشغّل خدمة الـPush الخاصة به (Android/desktop
// بيشتغلوا حتى لو المتصفح مقفول تمامًا؛ iOS محتاج إضافة الموقع للشاشة
// الرئيسية "أضف إلى الشاشة الرئيسية" عشان الإشعارات تشتغل).
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "إشعار جديد", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "إشعار جديد";
  const options = {
    body: data.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || ("notif-" + Date.now()),
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || "./" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// الضغط على الإشعار: يفتح تاب موجود لو فيه، أو يفتح تاب جديد للبرنامج.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
