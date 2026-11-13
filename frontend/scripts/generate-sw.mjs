import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "..", "dist");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = (await walk(distDir)).filter((file) => {
  const rel = path.relative(distDir, file).split(path.sep).join("/");
  return rel !== "sw.js" && !rel.endsWith(".map");
});

const entries = [];
for (const file of files) {
  const rel = "/" + path.relative(distDir, file).split(path.sep).join("/");
  const buf = await readFile(file);
  entries.push({
    url: rel,
    revision: createHash("sha256").update(buf).digest("hex").slice(0, 8),
  });
}
entries.sort((a, b) => a.url.localeCompare(b.url));

const version = createHash("sha256")
  .update(entries.map((entry) => entry.url + ":" + entry.revision).join("|"))
  .digest("hex")
  .slice(0, 10);

const sw = `/* Service worker Bhinneka Tunggal Ika - dibuat otomatis saat build. */
const VERSION = ${JSON.stringify(version)};
const CACHE_NAME = "bti-" + VERSION;
const FONT_CACHE = "bti-fonts";
const PRECACHE = ${JSON.stringify(
  entries.map((entry) => entry.url),
  null,
  2
)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch (error) {
            // Satu aset gagal tidak boleh membatalkan seluruh instalasi.
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("bti-") && key !== CACHE_NAME && key !== FONT_CACHE
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  // ignoreVary: aset dari Vite memakai header "Vary: Origin", sedangkan request
  // hasil precache tidak punya header Origin. Tanpa ini, script/CSS gagal
  // dimuat saat offline meskipun sudah tersimpan di cache.
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put("/index.html", response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = (await cache.match("/index.html")) || (await cache.match("/"));
    return cached || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Data API selalu dari jaringan; aplikasi punya fallback lokal.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  const isFont =
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  if (isFont) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
  }
});
`;

await writeFile(path.join(distDir, "sw.js"), sw, "utf8");
console.log("[sw] " + entries.length + " aset di-precache, versi " + version);
