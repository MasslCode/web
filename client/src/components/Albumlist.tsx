/* eslint-disable react/prop-types */
import { Typography, List, ListItemButton } from "@mui/material";
import { useEffect, useRef, useState } from "react"
import ScoreDialog from "./ScoreDialog.tsx";
import CircularProgress from '@mui/material/CircularProgress';
import type { MusicAlbum } from '@/lib/music';
import { albumPlaceholder, handleCoverError } from '@/lib/albumCover';
import { songLoader } from '@/lib/songLoader.js';

interface AlbumlistProps {
  query: string;
  onSuccess: (album: any) => void;
}

export default function Albumlist({ query, onSuccess }: AlbumlistProps)
{
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<MusicAlbum | null>(null);
    const [albums, setAlbums] = useState<MusicAlbum[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelHoverPrefetch = () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    };

    const scheduleHoverPrefetch = (albumId: string) => {
      cancelHoverPrefetch();
      hoverTimer.current = setTimeout(() => songLoader.prefetch(BASE_URL, albumId), 200);
    };

    const handleAlbumClick = (album: MusicAlbum) => {
      setSelectedAlbum(album);
      setDialogOpen(true);
    };

    const handleDialogClose = () => {
      setDialogOpen(false);
    }

    const BASE_URL = import.meta.env.VITE_API_MUSIC_BASE_URL;

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        let firstAlbumTimer: ReturnType<typeof setTimeout> | undefined;
        setError(null);
        const fetchAlbums = async () => {
            setLoading(true);
            setAlbums([]);
            try {
                const response = await fetch(`${BASE_URL}/api/search-albums?query=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
                const body = await response.json();
                if (cancelled) return;

                if (!response.ok || !Array.isArray(body)) {
                    console.error("Error fetching albums:", response.status, body);
                    setError(body.error || 'Unable to search albums. Please try again.');
                    setAlbums([]);
                    return;
                }

                setAlbums(body);
                // Warm just the top result after the user pauses on this search.
                if (body[0]) firstAlbumTimer = setTimeout(() => songLoader.prefetch(BASE_URL, body[0].id), 600);
              } catch (error) {
                  if (cancelled) return;
                  console.error("Error fetching albums:", error);
                  setError('Unable to search albums. Please try again.');
                  setAlbums([]);
              } finally {
                  if (!cancelled) setLoading(false);
              }
          };
        if (query.trim()) {
            fetchAlbums();
        }
        else
        {
            setAlbums([]);
            setLoading(false);
        }

        return () => {
        cancelled = true;
        controller.abort();
        clearTimeout(firstAlbumTimer);
        cancelHoverPrefetch();
        };
    }, [query, BASE_URL]);

return (
    <div>
      {error && <Typography role="alert" color="error">{error}</Typography>}
      {albums.length === 0 && !loading && !error ? (
        <p>No albums found.</p>
      ) : (
        <div>
        {albums.map((album, index) => (
            <List 
              key={album.id}
              sx={{ 
                width: '100%', 
                maxWidth: 360, 
                backgroundColor: 'rgb(155, 167, 219)',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0. 0.1)',
              }}>
              <ListItemButton
                onClick={() => handleAlbumClick(album)}
                onMouseEnter={() => scheduleHoverPrefetch(album.id)}
                onMouseLeave={cancelHoverPrefetch}
                onFocus={() => songLoader.prefetch(BASE_URL, album.id)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  '&:hover': {
                    backgroundColor: 'rgba(248, 215, 108, 0.16)',
                    }, 
                  }}>
                {/* React 18 needs lowercase fetchpriority; spread keeps React's JSX types compatible. */}
                <img src={album.cover_thumbnail || album.cover_image || albumPlaceholder}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  {...{ fetchpriority: index === 0 ? 'high' : 'auto' }} decoding="async"
                  width={55} height={55} onError={handleCoverError} alt={`${album.title} cover`}
                  style={{ width: "55px", height: "55px", flexShrink: 0, borderRadius: "4px", objectFit: "cover", backgroundImage: `url(${albumPlaceholder})`, backgroundSize: 'cover' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>{album.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{album.artist}</Typography>
              </div>
              </ListItemButton>
            </List>
        ))}
        {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <CircularProgress size={24} />
            </div>
          )}
        </div>
      )}
      {selectedAlbum && (
        <ScoreDialog 
          open={dialogOpen}
          album={selectedAlbum}
          onClose={handleDialogClose}
          albumID={selectedAlbum.id}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
