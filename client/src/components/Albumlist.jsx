/* eslint-disable react/prop-types */
import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import { useEffect, useState } from "react"

export default function Albumlist({ query })
{
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/search-albums?query=${query}`);
                const rawAlbums = await response.json();
                const formattedAlbums = rawAlbums.map((album) => ({
                    title: album.name,
                    artist: album.artists.map((artist) => artist.name).join(' - '),
                    release_date: album.release_date,
                    cover_image: album.images[0]?.url,
                  }));
                setAlbums(formattedAlbums);
            } catch (error) {
                console.error("Error fetching albums:" , error);
            }
        };

        if (query) {
            fetchAlbums();
        }
    }, [query]);

return (
    <div>
      {albums.length === 0 ? (
        <p>No albums found.</p>
      ) : (
        albums.map((album, index) => (
            <List 
              key={index} 
              sx={{ 
                width: '100%', 
                maxWidth: 360, 
                bgcolor: 'background.paper',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0. 0.1)',
              }}>
              <ListItemButton 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  '&:hover': {
                    backgroundColor: 'rgba(90, 243, 230, 0.2)',
                    }, 
                  }}>
                <img src={album.cover_image} alt={`${album.title} cover`} style={{ width: "55px", height: "55px", borderRadius: "4px", objectFit: "cover" }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>{album.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{album.artist}</Typography>
              </div>
              </ListItemButton>
            </List>
        ))
      )}
    </div>
  );
}