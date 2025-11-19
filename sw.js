const HTML_MIME = "text/html; charset=utf-8";
const SKIP_SUFFIX = ["/", ".raw"];
const STATIC_CACHE = "blog-static-v1";
const CACHE_ALLOWLIST = [STATIC_CACHE];
const STATIC_EXTENSIONS = [
    ".css",
    ".js",
    ".mjs",
    ".woff",
    ".woff2",
    ".ttf",
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".avif",
    ".xml",
    ".txt",
    ".pdf",
    ".json",
    ".map",
];

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((key) => !CACHE_ALLOWLIST.includes(key))
                    .map((key) => caches.delete(key))
            );
            await self.clients.claim();
        })()
    );
});

function isSameOrigin(request) {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
}

function shouldHandleStatic(request) {
    if (request.method !== "GET") {
        return false;
    }
    if (!isSameOrigin(request)) {
        return false;
    }
    if (request.destination === "document") {
        return false;
    }
    const url = new URL(request.url);
    return (
        STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext)) ||
        url.pathname.startsWith("/fonts/")
    );
}

async function refreshStaticAsset(cache, request) {
    try {
        const response = await fetch(request);
        if (response && response.ok && response.type !== "opaque") {
            await cache.put(request, response.clone());
        }
    } catch (error) {
        // Network refresh failures are non-fatal for cached renders.
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (shouldHandleStatic(request)) {
        event.respondWith(
            (async () => {
                const cache = await caches.open(STATIC_CACHE);
                const cached = await cache.match(request);
                if (cached) {
                    event.waitUntil(refreshStaticAsset(cache, request));
                    return cached;
                }

                try {
                    const response = await fetch(request);
                    if (response && response.ok && response.type !== "opaque") {
                        await cache.put(request, response.clone());
                    }
                    return response;
                } catch (error) {
                    return Response.error();
                }
            })()
        );
        return;
    }

    if (request.mode !== "navigate") {
        return;
    }

    const url = new URL(request.url);
    if (SKIP_SUFFIX.some((suffix) => url.pathname.endsWith(suffix))) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                const response = await fetch(request);
                const contentType =
                    response.headers.get("content-type")?.toLowerCase() ?? "";

                if (contentType.includes("text/html")) {
                    return response;
                }

                const body = await response.text();
                const headers = new Headers(response.headers);
                headers.set("content-type", HTML_MIME);

                return new Response(body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers,
                });
            } catch (error) {
                return Response.error();
            }
        })()
    );
});
