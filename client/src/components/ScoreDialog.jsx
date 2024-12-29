/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, Typography, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react"
import SongRating from "./Rating";

export default function ScoreDialog({open, album, onClose, onSave, albumID})
{
    const [songs, setSongs] = useState([]);

        useEffect(() => {
            const fetchSongs = async () => {
                try {
                    console.log(albumID);
                    const response = await fetch(`http://localhost:3001/api/fetch-songs?albumId=${albumID}`);
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
                } catch (error) {
                    console.error("Error fetching our API endpoint:", error);
                }
            };

            if(albumID)
            {
                fetchSongs();
            }
        }, [albumID]);
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
            }}
        >
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
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0'
                        }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{song.title}</Typography>
                    <SongRating />
                  </ListItem>
                  ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}> Cancel </Button>
                <Button variant="contained" onClick={onSave}> Save </Button>
            </DialogActions>               
        </Dialog>
    );
}