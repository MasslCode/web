


/** THIS IS A LEGACY COMPONENT, NOT NEEDED ANYMORE */

/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogTitle, Button, DialogContent, Typography, Box, CircularProgress, List, ListItem, Slider } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import RatingSlider from "./RatingSlider";

export default function EditDialog({open, close, album})
{
    const BASE_URL_DB = "https://albums-ink9.onrender.com";

    const [loading, setLoading] = useState(false);
    const [songs, setSongs] = useState([]);
    const [rating, setRating] = useState(album?.average_rating || null);

    const handleEditSave = async () => {
        
    };

    const fetchSongs = useCallback (async (albumid) => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL_DB}/api/albums/${albumid}/songs`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                if (!response.ok) {
                throw new Error('Failed to fetch songs');
                }

                const songData = await response.json();
                setSongs(songData);
            } catch (error) {
                console.error("Error fetching songs:", error);
                setSongs([]);
            }
            finally
            {
                setLoading(false);
            }
    }, []);

    useEffect(() => {
        if(album?.id && open)
        {
            fetchSongs(album?.id);
            setRating(album?.average_rating || null);
        }
        else
        {
            setSongs([]);
            setRating(null);
        }
        //setNeedsRelisten(album.needs_relisten || false);
        
    },[open, fetchSongs, album]);
    
    return (
        <Dialog
            open={open}
            onClose={close}
            sx={{ 
                '& .MuiDialog-paper': {
                    width: '30vw',
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
             {album?.title}
            </DialogTitle>
            <DialogContent dividers>
                <Box
                    component="img"
                    src={album?.cover_image}
                    alt="cover not found"
                    sx={{
                        width: 200,
                        height: 200,
                        borderRadius: 1,
                        objectFit: 'cover',
                        marginRight: 2,
                        textAlign: 'center',
                    }}
                />
                <Typography variant="h4">Songs</Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={100}>
                        <CircularProgress />
                    </Box>
                ) : songs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No songs found for this album.
                    </Typography>
                ) : (
                    <List dense>
                        {songs.map(song => (
                            <ListItem key={song.id}>
                                {song.title}
                            </ListItem>
                        ))}
                    </List>
                )}
            <Box mt={3}>
                <Typography gutterBottom>Rate this album (1–10)</Typography>
                <RatingSlider value={rating} onChange={(val) => setRating(val)} />
            </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={close}> Cancel </Button>
                <Button variant="contained" color="success" onClick={handleEditSave}> Save </Button>
            </DialogActions>
        </Dialog>
    );
}
