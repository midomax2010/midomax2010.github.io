// Service Worker بسيط لبرنامج التوصيل
// بيخزن الصفحة الأساسية والأيقونات محليًا عشان التطبيق يفتح أسرع
// ويشتغل حتى لو النت بطيء أو الاتصال انقطع لحظيًا (البيانات نفسها بتتحدث من Supabase بس الواجهة بتفتح فورًا)

const CACHE_NAME = "delivery-app-cache-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./driver.html",
  "./manifest.json",
  "./manifest-driver.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // نضيف الملفات واحد واحد بدل addAll عشان لو ملف مش موجود
      // (زي icon-512.png لو لسه معملتوش) الباقي يتخزن عادي من غير ما يفشل الكل
      return Promise.all(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // بس نطبق الكاش على طلبات GET من نفس الموقع (الصفحات والأيقونات)
  // أي طلب لـ Supabase (بيانات حية) بيعدي عادي من غير تخزين
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
