const HTML_MIME = "text/html; charset=utf-8";
const SKIP_SUFFIX = ["/", ".raw"];

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode !== "navigate") {
        return;
    }

    const url = new URL(event.request.url);
    if (SKIP_SUFFIX.some((suffix) => url.pathname.endsWith(suffix))) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                const response = await fetch(event.request);
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
