// In production the frontend build is served by PocketBase itself (pb_public),
// and the static file handler only sends Last-Modified. Browsers then apply
// heuristic caching to index.html (roughly 10% of the file's age), so after a
// deploy they could keep an old index.html pointing at hashed assets that no
// longer exist.
//
// - /assets/* are content-hashed by Vite: cache them forever.
// - Everything else outside the API and the dashboard (index.html, SPA routes,
//   /branding/*) must be revalidated on every request (cheap 304s).
//
// In development the frontend is served by Vite, so this middleware is a no-op.
//
// Everything lives inside the handler on purpose: PocketBase runs each hook in
// its own context, where file-scope helpers are not visible.
routerUse((event) => {
  const path = event.request.url.path;

  if (!path.startsWith("/api/") && !path.startsWith("/_/")) {
    event.response
      .header()
      .set(
        "Cache-Control",
        path.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      );
  }

  return event.next();
});
