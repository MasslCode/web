import type { MusicSong } from './music';

interface SongLoader {
  getCached(baseURL: string, albumId: string): MusicSong[] | undefined;
  load(baseURL: string, albumId: string): Promise<MusicSong[]>;
  prefetch(baseURL: string, albumId: string): void;
}

export function createSongLoader(options?: {
  fetcher?: typeof fetch;
  now?: () => number;
  cacheTTL?: number;
}): SongLoader;

export const songLoader: SongLoader;
