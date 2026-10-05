import axios from 'axios';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// One queue per server process, shared by searches, lookups and retries.
export function createMusicBrainzClient({
  get = axios.get,
  userAgent = process.env.MUSICBRAINZ_USER_AGENT || 'AlbumReviewApp/1.0 (https://github.com/MasslCode/web)',
  now = Date.now,
  sleep = wait,
  interval = 1100,
  cacheTTL = 5 * 60 * 1000,
} = {}) {
  let queue = Promise.resolve();
  let nextRequestAt = 0;
  const cache = new Map();
  const pending = new Map();

  function schedule(request) {
    const result = queue.then(async () => {
      const delay = nextRequestAt - now();
      if (delay > 0) await sleep(delay);
      nextRequestAt = now() + interval;
      return request();
    });
    queue = result.catch(() => {});
    return result;
  }

  async function fetchData(path, params) {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await schedule(() => get(`https://musicbrainz.org/ws/2/${path}`, {
          params: { ...params, fmt: 'json' },
          headers: { 'User-Agent': userAgent, Accept: 'application/json' },
          timeout: 15000,
        }));
        return response.data;
      } catch (error) {
        if (![429, 503].includes(error.response?.status) || attempt >= 2) throw error;
        const retryAfter = error.response?.headers?.['retry-after'];
        const seconds = Number(retryAfter);
        const retryAt = retryAfter && !Number.isFinite(seconds) ? Date.parse(retryAfter) : NaN;
        const delay = Number.isFinite(seconds) && seconds > 0
          ? seconds * 1000
          : Number.isFinite(retryAt) ? Math.max(0, retryAt - now()) : 2000 * 2 ** attempt;
        // Back off the whole queue so other requests do not worsen throttling.
        nextRequestAt = Math.max(nextRequestAt, now() + delay);
      }
    }
  }

  return {
    request(path, params = {}) {
      const key = `${path}?${new URLSearchParams(params).toString()}`;
      const cached = cache.get(key);
      if (cached && cached.expires > now()) return Promise.resolve(cached.data);
      if (pending.has(key)) return pending.get(key);

      const promise = fetchData(path, params).then((data) => {
        cache.delete(key);
        cache.set(key, { data, expires: now() + cacheTTL });
        if (cache.size > 200) cache.delete(cache.keys().next().value);
        return data;
      }).finally(() => pending.delete(key));
      pending.set(key, promise);
      return promise;
    },
  };
}
