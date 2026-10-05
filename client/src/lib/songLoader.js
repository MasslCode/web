// Shared by the drawer's speculative loads and the dialog's explicit loads.
// Keeping this dependency-free also lets Node exercise cache and race behavior.
export function createSongLoader({ fetcher = (...args) => fetch(...args), now = Date.now, cacheTTL = 30 * 60 * 1000 } = {}) {
  const cache = new Map();
  const pending = new Map();
  let prefetching = false;
  const keyFor = (baseURL, albumId) => `${baseURL}/api/fetch-songs?albumId=${encodeURIComponent(albumId)}`;

  function getCached(baseURL, albumId) {
    const entry = cache.get(keyFor(baseURL, albumId));
    return entry && entry.expires > now() ? entry.songs : undefined;
  }

  function load(baseURL, albumId) {
    const url = keyFor(baseURL, albumId);
    const cached = getCached(baseURL, albumId);
    if (cached) return Promise.resolve(cached);
    if (pending.has(url)) return pending.get(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const request = Promise.resolve().then(() => fetcher(url, { signal: controller.signal }))
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error || 'Unable to load tracks. Please try again.');
        if (!Array.isArray(body) || !body.length) throw new Error('No tracklist is available for this album.');
        cache.delete(url);
        cache.set(url, { songs: body, expires: now() + cacheTTL });
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        return body;
      }).finally(() => {
        clearTimeout(timeout);
        pending.delete(url);
      });
    pending.set(url, request);
    return request;
  }

  return {
    getCached,
    load,
    prefetch(baseURL, albumId) {
      if (prefetching || getCached(baseURL, albumId) || pending.has(keyFor(baseURL, albumId))) return;
      prefetching = true;
      // A failed speculative request must not show an error or poison a later click.
      void load(baseURL, albumId).catch(() => {}).finally(() => { prefetching = false; });
    },
  };
}

export const songLoader = createSongLoader();
