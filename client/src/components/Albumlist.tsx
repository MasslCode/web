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
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/search-albums?query=${query}`);
                const rawAlbums = await response.json();
                console.log(query);
                console.log(rawAlbums);
                interface RawAlbum {
                  id: string;
                  type: string;
                  attributes: {
                    title: string;
                    numberOfItems: number;
                    type: string;
                    albumType: string;
                    releaseDate: string;
                    imageLinks?: { href: string; meta: { width: number; height: number } }[];
                    externalLinks?: { href: string; meta: { type: string } }[];
                  };
                  relationships: {
                    artists: { links: { self: string } };
                  };
                }

                const included = rawAlbums?.included ?? [];
                console.log('Total included items:', included.length);
                console.log('First raw album:', JSON.stringify(included[0], null, 2));
                included.forEach((album: any, i: number) => {
                  console.log(`Album ${i}:`, {
                    title:          album.attributes?.title,
                    numberOfItems:  album.attributes?.numberOfItems,
                    type:           album.attributes?.type,
                    albumType:      album.attributes?.albumType,
                    releaseDate:    album.attributes?.releaseDate,
                  });
                });
                const formattedAlbums = included
                  .filter((album: RawAlbum) =>
                    album.type === 'albums' &&
                    album.attributes?.numberOfItems >= 5 &&
                    album.attributes?.type !== 'COMPILATION'
                  )
                  .map((album: RawAlbum) => ({
                    id:           album.id,
                    title:        album.attributes?.title,
                    artist:       '',
                    release_year: new Date(album.attributes?.releaseDate).getFullYear(),
                    cover_image:  '',
                  }));
                setAlbums(formattedAlbums);
                formattedAlbums.forEach((album: any, i: number) => {
                setTimeout(async () => {
                    try {
                        const res = await fetch(`${BASE_URL}/api/album-cover/${album.id}?countryCode=AT`);
                        const data = await res.json();
                        if (data?.url) {
                            setAlbums(prev => prev.map(a =>
                                a.id === album.id ? { ...a, cover_image: data.url } : a
                            ));
                        }
                    } catch {
                        // silently skip failed covers
                    }
                }, i * 500); // 500ms stagger between each request
            });

              } catch (error) {
                  console.error("Error fetching albums:", error);
              } finally {
                  setLoading(false);
              }
          };
        if (query) {
            fetchAlbums();
        }
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