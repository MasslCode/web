import { Dialog, DialogActions, DialogTitle, Button, DialogContent, Typography, Box, CircularProgress, List, ListItem } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { TransitionProps as MuiTransitionProps } from "@mui/material/transitions";
import SliderRating from "./SliderRating.tsx";


interface EditDialogProps {
    open: boolean;
    close: () => void;
    album: { id: number; title: string; cover_image: string; average_rating: number } | null;
    success: (album: any) => void;
    TransitionProps?: MuiTransitionProps;
}

interface Song {
    id: number;
    title: string;
}

export default function EditDialog({open, close, album, success, TransitionProps}: EditDialogProps)
{
    const BASE_URL_DB = "https://albums-ink9.onrender.com";

    const [loading, setLoading] = useState(false);
    const [songs, setSongs] = useState<Song[]>([]);
    const [rating, setRating] = useState<number>(album?.average_rating || 0);

    const handleEditSave = async () => {
        try {
            const response = await fetch(`${BASE_URL_DB}/api/edit-album`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: album?.id,
                    average_rating: rating.toFixed(0)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server error response:", errorData);
            throw new Error("Failed to update album. PUT request failed.");
        }
            const data = await response.json();
            console.log("Album updated: ", data);
            if(success) {
                success(album);
                console.log("onsavesuccess called...");
            }              
            close(); // Close the dialog after saving
        } catch (error) {
            console.error("Error updating album:", error);
        }
    };

    const fetchSongs = useCallback (async (albumid: any) => {
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
            setRating(album?.average_rating || 0);
        }
        else
        {
            setSongs([]);
            setRating(0);
        }
        //setNeedsRelisten(album.needs_relisten || false);
        
    },[open, fetchSongs, album]);
    
    return (
        <Dialog
            open={open}
            onClose={close}
            TransitionProps={TransitionProps}
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
                <SliderRating value={rating ?? 0} onChange={(val) => setRating(val)} min={1} max={10} />
            </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={close}> Cancel </Button>
                <Button variant="contained" color="success" onClick={handleEditSave}> Save </Button>
            </DialogActions>
        </Dialog>
    );
}
