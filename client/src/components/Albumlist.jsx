/* eslint-disable react/prop-types */
import { Typography, List, ListItemButton } from "@mui/material";
import { useEffect, useState } from "react"
import { addAlbum } from "../features/browsedb.js"
import ScoreDialog from "./ScoreDialog.jsx";

export default function Albumlist({ query })
{
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [albums, setAlbums] = useState([]);

    const handleAlbumClick = (album) => {
      setSelectedAlbum(album);
      setDialogOpen(true);
    };

    const handleDialogClose = () => {
      setDialogOpen(false);
      setSelectedAlbum(null);
    }

    const handleDialogSave = (album) => {
      console.log("Saving album: ", album);
      handleDialogClose;
    }
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/search-albums?query=${query}`);
                const rawAlbums = await response.json();
                console.log(rawAlbums);
                const formattedAlbums = rawAlbums
                  .filter((album) => (album.total_tracks > 5) && (album.album_type !== "compilation"))
                  .map((album) => ({
                    id: album.id,
                    title: album.name,
                    artist: album.artists.map((artist) => artist.name).join(' - '),
                    release_year: new Date(album.release_date).getFullYear(),
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
        ))
        
      )}
      <ScoreDialog 
        open={dialogOpen}
        album={selectedAlbum}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        albumID={selectedAlbum?.id}
      />
    </div>
  );
}