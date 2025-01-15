/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, Typography, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react"
import SongRating from "./Rating";
import { getColorForValue } from '../../../backend/colors';
import CircularProgress from '@mui/material/CircularProgress';

export default function ScoreDialog({open, album, onClose, albumID, onSuccess})
{
    const [songs, setSongs] = useState([]);
    const [songColors, setSongColors] = useState([]);
    const [loading, setLoading] = useState(false);

    const BASE_URL = "https://web-u92g.onrender.com";
    const BASE_URL_DB = "https://albums-ink9.onrender.com";

    const handleRatingChange = (index, ratingColor) => {
        setSongColors((prevRatings) => {
            const newRatings = [...prevRatings];
            newRatings[index] = ratingColor;
            return newRatings;
        });
    };

    const handleSave = async () => {
        const validRatings = songs.filter((_, index) => (songColors[index] || 0) > 0);

        const album_total_rating = validRatings.reduce((acc, song) => {
            const rating = songColors[songs.indexOf(song)] || 0;
            return acc + rating;
        }, 0);

        const averageRating = validRatings.length > 0 ? album_total_rating / validRatings.length : 0;

        console.log(averageRating);
        
        const payload = {
            album: {
                id: albumID,
                title: album?.title,
                artist: album?.artist,
                release_year: album?.release_year,
                average_rating: parseFloat(averageRating.toFixed(2)),
                cover_image: album?.cover_image,
            },
            
            songs: songs.map((song, index) => ({
                id: song.id,
                title: song.title,
                duration_in_sec: song.duration_in_sec,
                track_number: song.track_number,
                rating: songColors[index] || 0,
            })),
        };
        console.log("Payload: ", payload);
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL_DB}/api/save-album`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (response.ok) {
                console.log('Album and songs saved successfully!', payload.album.average_rating);
                if(onSuccess) {
                    onSuccess();
                    console.log("onsavesuccess called...");
                }              
                onClose(); // Close the dialog after saving
              } else {
                console.error('Failed to save album:', response.statusText);
              }
        } catch (error) {
            console.error('Error saving album:', error);
        } finally {
            setLoading(false);
        }
    }
        useEffect(() => {
            const fetchSongs = async () => {
                try {
                    
                    console.log(albumID);
                    setLoading(true);
                    const response = await fetch(`${BASE_URL}/api/fetch-songs?albumId=${albumID}`);
                    if (!response.ok) {
                        if (response.status === 503) 
                        {
                          const responseBody = await response.json();
                          const retryAfter = responseBody.retryAfter;
                          console.warn(`Rate-limited. Retrying after ${retryAfter} seconds.`);
                          setTimeout(() => fetchSongs(albumID), retryAfter * 1000);
                          return;
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                    const rawSongs = await response.json();
                    console.log(rawSongs);
                    const formattedSongs = rawSongs.map((song) => ({
                        id: song.id,
                        album_id: albumID,
                        title: song.name,
                        duration_in_sec: Math.round(song.duration_ms/1000),
                        track_number: song.track_number,
                    }))
                    setSongs(formattedSongs);
                    console.log(formattedSongs);

                    const defaultColors = new Array(formattedSongs.length).fill('black');
                    setSongColors(defaultColors);
                } catch (error) {
                    console.error("Error fetching our API endpoint:", error);
                } finally {
                    setLoading(false);
                }
            };

            if(albumID && open)
            {
                fetchSongs();
            }
        }, [albumID, open]);

        if(!open) return null;
        
    return (
        <Dialog 
            open={open}
            onClose={onClose}
            sx={{ 
                '& .MuiDialog-paper': {
                    width: 'auto',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                }
            }}>
            <DialogTitle
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    padding: 2,
                    fontSize: '1.5rem',
                }}>
             Add album to collection
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={() => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'grey',
                  })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent
                sx={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: 2
                }}
            >
              <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 2,
                }}>
                <Box
                    component="img"
                    src={album?.cover_image}
                    alt="cover not found"
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        objectFit: 'cover',
                        marginRight: 2,
                    }}
                />
                <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>{album?.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', marginBottom: "10px" }}>{album?.artist}</Typography>
                </Box>
              </Box>
                <List>
                    {songs.map((song, index) => (
                  <ListItem
                        key={song.id}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0'
                        }}>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.1rem',
                            color: getColorForValue(songColors[index]),
                            }}>
                        {song.title}
                    </Typography>
                    <SongRating
                        onRatingChange={(newRating) => {
                            handleRatingChange(index, newRating);
                        }}
                    />
                  </ListItem>
                  ))}
                </List>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}> Cancel </Button>
                <Button variant="contained" onClick={handleSave}> Save </Button>
            </DialogActions>               
        </Dialog> 
    );
}