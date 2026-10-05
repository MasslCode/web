function durationSeconds(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value) : null;
}

export function formatDuration(value: number | null | undefined): string {
  const seconds = durationSeconds(value);
  if (seconds === null) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}`
    : `${minutes}:${remainder}`;
}

export function formatAlbumRuntime(songs: { duration_in_sec?: number | null }[]): string {
  let total = 0;
  let missing = 0;
  for (const song of songs) {
    const seconds = durationSeconds(song.duration_in_sec);
    if (seconds === null) missing++;
    else total += seconds;
  }
  if (!songs.length || missing === songs.length) return 'Unavailable';
  const runtime = formatDuration(total);
  return missing > 0
    ? `At least ${runtime} (${missing} track duration${missing === 1 ? '' : 's'} unavailable)`
    : runtime;
}
