export function normalizeSongDurations<T extends {
  duration_in_sec?: number | null;
  duration_in_ISO8601?: string | null;
}>(songs: T[]): (T & { duration_in_sec: number | null })[];
