export interface MusicAlbum {
  id: string;
  title: string;
  artist: string;
  release_year: number | null;
  cover_image: string | null;
  cover_thumbnail?: string | null;
}

export interface MusicSong {
  id: string;
  title: string;
  duration_in_sec: number | null;
  track_number: number;
}
