/* eslint-disable react/prop-types */
import { Typography, List, ListItemButton } from "@mui/material";
import { useEffect, useState } from "react"
import ScoreDialog from "./ScoreDialog.tsx";
import CircularProgress from '@mui/material/CircularProgress';

interface AlbumlistProps {
  query: string;
  onSuccess: (album: any) => void;
}

interface Album {
  id: number;
  title: string;
  artist: string;
  release_year: number;
  cover_image: string;
}

export default function Albumlist({ query, onSuccess }: AlbumlistProps)
{
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAlbumClick = (album: any) => {
      setSelectedAlbum(album);
      setDialogOpen(true);
    };

    const handleDialogClose = () => {
      setDialogOpen(false);
    }

    const BASE_URL = import.meta.env.VITE_API_MUSIC_BASE_URL;

    useEffect(() => {
        let cancelled = false;
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/search-albums?query=${query}`);
                const formattedAlbums = await response.json();
                console.log(query);
                console.log(formattedAlbums);
                if (cancelled) return;
                setAlbums(formattedAlbums);
              } catch (error) {
                  if (cancelled) return;
                  console.error("Error fetching albums:", error);
              } finally {
                  if (!cancelled) setLoading(false);
              }
          };
        if (query) {
            fetchAlbums();
        }
        else
        {
            setAlbums([]);
        }

        return () => {
        cancelled = true;
        };
    }, [query]);

return (
    <div>
      {albums.length === 0 && !loading ? (
        <p>No albums found.</p>
      ) : (
        <div>
        {albums.map((album, index) => (
            <List 
              key={index} 
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
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  '&:hover': {
                    backgroundColor: 'rgba(248, 215, 108, 0.16)',
                    }, 
                  }}>
                <img src={album.cover_image} alt={`${album.title} cover`} style={{ width: "55px", height: "55px", borderRadius: "4px", objectFit: "cover" }} />
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