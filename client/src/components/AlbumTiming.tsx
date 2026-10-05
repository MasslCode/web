import { Typography } from '@mui/material';
import { formatAlbumRuntime, formatDuration } from '@/lib/duration';

export function SongDuration({ seconds }: { seconds: number | null | undefined }) {
  const duration = formatDuration(seconds);
  return (
    <Typography component="span" variant="body2" color="text.secondary"
      aria-label={`Duration: ${duration === '—' ? 'unavailable' : duration}`}
      sx={{ marginLeft: 2, flexShrink: 0, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      {duration}
    </Typography>
  );
}

export function AlbumRuntime({ songs }: { songs: { duration_in_sec?: number | null }[] }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
      Album runtime: {formatAlbumRuntime(songs)}
    </Typography>
  );
}
