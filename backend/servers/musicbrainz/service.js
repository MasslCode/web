import { createHash } from 'node:crypto';

export const isMBID = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function buildSearchQuery(query) {
  // Quote each term so user input cannot inject Lucene operators or filters.
  const terms = query.trim().split(/\s+/).map((term) => `"${term.replace(/[\\"]/g, '\\$&')}"`);
  const titleOrArtist = terms.map((term) => `(releasegroup:${term} OR artist:${term})`).join(' AND ');
  return `(${titleOrArtist}) AND (primarytype:album OR primarytype:ep)`;
}

function artistName(credits = []) {
  return credits.map((credit) => typeof credit === 'string'
    ? credit
    : `${credit.name || credit.artist?.name || ''}${credit.joinphrase || ''}`).join('') || 'Unknown artist';
}

export function formatAlbum(group) {
  const date = group['first-release-date'];
  return {
    id: group.id,
    title: group.title,
    artist: artistName(group['artist-credit']),
    release_year: /^\d{4}/.test(date || '') ? Number(date.slice(0, 4)) : null,
    cover_image: `https://coverartarchive.org/release-group/${group.id}/front-500`,
    cover_thumbnail: `https://coverartarchive.org/release-group/${group.id}/front-250`,
    type: (group['primary-type'] || '').toUpperCase(),
    source: 'musicbrainz',
  };
}

export function formatSongs(release, albumId) {
  const media = [...(release.media || [])].sort((a, b) => a.position - b.position);
  let trackNumber = 0;
  return media.flatMap((medium) => [...(medium.tracks || [])]
    .sort((a, b) => a.position - b.position)
    .map((track) => {
      trackNumber++;
      const length = track.length ?? track.recording?.length;
      return {
        // A recording can occur on many albums. Track IDs identify an occurrence.
        id: track.id || createHash('sha256').update(`${albumId}:${release.id}:${medium.position}:${track.position}`).digest('hex').slice(0, 40),
        title: track.title || track.recording?.title || 'Untitled track',
        duration_in_sec: Number.isFinite(length) && length >= 0 ? Math.round(length / 1000) : null,
        track_number: trackNumber,
      };
    }));
}

function releaseOrder(a, b) {
  const hasTracks = (release) => (release.media || []).some((medium) => medium['track-count'] > 0);
  const date = (release) => release.date ? release.date.padEnd(10, '-00') : '9999-99-99';
  const tracks = (release) => (release.media || []).reduce((sum, medium) => sum + (medium['track-count'] || 0), 0);
  return Number(hasTracks(b)) - Number(hasTracks(a))
    || date(a).localeCompare(date(b))
    || tracks(a) - tracks(b)
    || a.id.localeCompare(b.id);
}

export function createMusicBrainzService(client, { now = Date.now, cacheTTL = 30 * 60 * 1000 } = {}) {
  const songCache = new Map();
  const pendingSongs = new Map();
  async function browseReleases(albumId, status) {
    const releases = [];
    let count;
    do {
      const page = await client.request('release', {
        'release-group': albumId, inc: 'media', limit: 100, offset: releases.length,
        ...(status ? { status } : {}),
      });
      if (!page.releases?.length) break;
      releases.push(...page.releases);
      count = page['release-count'];
    } while (releases.length < count);
    return releases;
  }

  function completeSongs(release, albumId, minimumTracks = 0) {
    const songs = formatSongs(release, albumId);
    const expectedTracks = (release.media || []).reduce((sum, medium) => sum + (medium['track-count'] || 0), 0);
    return songs.length && songs.length >= Math.max(expectedTracks, minimumTracks) ? songs : null;
  }

  async function resolveSongs(albumId) {
    let releases = await browseReleases(albumId, 'official');
    if (!releases.length) releases = await browseReleases(albumId);
    releases.sort(releaseOrder);
    // Try the earliest official release first, with fallbacks for incomplete entries.
    for (const candidate of releases.slice(0, 3)) {
      const release = await client.request(`release/${candidate.id}`, { inc: 'recordings' });
      const expectedTracks = (candidate.media || []).reduce((sum, medium) => sum + (medium['track-count'] || 0), 0);
      const songs = completeSongs(release, albumId, expectedTracks);
      if (songs) return songs;
    }
    const error = new Error('No tracklist is available for this album in MusicBrainz.');
    error.status = 404;
    throw error;
  }

  return {
    async searchAlbums(query, limit) {
      const response = await client.request('release-group', { query: buildSearchQuery(query), limit });
      return (response['release-groups'] || []).map(formatAlbum);
    },
    fetchSongs(albumId) {
      const cached = songCache.get(albumId);
      if (cached && cached.expires > now()) return Promise.resolve(cached.songs);
      if (pendingSongs.has(albumId)) return pendingSongs.get(albumId);
      const promise = resolveSongs(albumId).then((songs) => {
        songCache.delete(albumId);
        songCache.set(albumId, { songs, expires: now() + cacheTTL });
        if (songCache.size > 100) songCache.delete(songCache.keys().next().value);
        return songs;
      }).finally(() => pendingSongs.delete(albumId));
      pendingSongs.set(albumId, promise);
      return promise;
    },
  };
}
