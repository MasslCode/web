function validSeconds(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  const seconds = Math.round(value);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

function legacySeconds(value) {
  if (typeof value !== 'string') return null;
  const match = /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(value);
  if (!match || !match.slice(1).some((part) => part !== undefined)) return null;
  return validSeconds(Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0));
}

// Normalize at the response boundary so display, caching and saving agree.
// An explicit null in the current contract means unknown, even if an old field exists.
export function normalizeSongDurations(songs) {
  return songs.map((song) => ({
    ...song,
    duration_in_sec: song.duration_in_sec !== undefined
      ? validSeconds(song.duration_in_sec)
      : legacySeconds(song.duration_in_ISO8601),
  }));
}
