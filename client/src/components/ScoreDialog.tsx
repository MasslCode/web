/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, Typography, Box, CircularProgress } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react"
import SliderRating from "./SliderRating.tsx";
import type { MusicAlbum, MusicSong } from '@/lib/music';
import { albumPlaceholder, handleCoverError } from '@/lib/albumCover';
import { songLoader } from '@/lib/songLoader.js';
import { AlbumRuntime, SongDuration } from './AlbumTiming';

interface ScoreDialogProps {
    open: boolean;
    album: MusicAlbum;
    onClose: () => void;
    albumID: string;
    onSuccess: (album: any) => void;
}

export default function ScoreDialog({open, album, onClose, albumID, onSuccess}: ScoreDialogProps)
{
    const [songs, setSongs] = useState<MusicSong[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [songsReady, setSongsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rating, setRating] = useState<number | null>(null);

    const BASE_URL = import.meta.env.VITE_API_MUSIC_BASE_URL;
    const BASE_URL_DB = import.meta.env.VITE_API_BASE_URL;

    const handleSave = async () => {
        if (rating === null || !songsReady || saving) return;
        
        const payload = {
            album: {
                id: albumID,
                title: album?.title,
                artist: album?.artist,
                release_year: album?.release_year,
                average_rating: parseFloat(rating.toFixed(0)),
                cover_image: album?.cover_image,
            },
            
            songs: songs.map((song) => ({
                id: song.id,
                title: song.title,
                duration_in_sec: song.duration_in_sec,
                track_number: song.track_number,
            })),
        };
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL_DB}/api/save-album`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (response.ok) {
                console.log('Album and songs saved successfully!', payload.album.average_rating);
                if(onSuccess) {
                    onSuccess(album);
                    console.log("onsavesuccess called...");
                }              
                onClose(); // Close the dialog after saving
              } else {
                const body = await response.json();
                setError(body.error || 'Unable to save this album. Please try again.');
              }
        } catch (error) {
            console.error('Error saving album:', error);
            setError('Unable to save this album. Please try again.');
        } finally {
            setSaving(false);
        }
    }
        useEffect(() => {
            if (!open) return;
            let cancelled = false;
            const cachedSongs = songLoader.getCached(BASE_URL, albumID);
            setSongs(cachedSongs || []);
            setSongsReady(Boolean(cachedSongs));
            setLoading(!cachedSongs);
            setRating(null);
            setError(null);
            const fetchSongs = async () => {
                try {
                    const body = await songLoader.load(BASE_URL, albumID);
                    if (cancelled) return;
                    setSongs(body);
                    setSongsReady(true);
                } catch (error) {
                    if (cancelled) return;
                    setError(error instanceof Error ? error.message : 'Unable to load tracks. Please try again.');
                } finally {
                    if (!cancelled) setLoading(false);
                }
            };

            if(albumID && open)
            {
                fetchSongs();
            }
            return () => {
                cancelled = true;
            };
        }, [albumID, open, BASE_URL]);

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
                    src={album.cover_thumbnail || album.cover_image || albumPlaceholder}
                    onError={handleCoverError}
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
                    {songsReady && !loading && <AlbumRuntime songs={songs} />}
                </Box>
              </Box>
              {loading && <Box display="flex" justifyContent="center"><CircularProgress size={24} aria-label="Loading tracks" /></Box>}
              {error && <Typography role="alert" color="error">{error}</Typography>}
                <List>
                    {songs.map((song) => (
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
                            color: 'black',
                            minWidth: 0,
                            overflowWrap: 'anywhere',
                            }}>
                        {song.title}
                    </Typography>
                    <SongDuration seconds={song.duration_in_sec} />
                  </ListItem>
                  ))}
                </List>
            <SliderRating value={rating ?? 0} onChange={(val) => setRating(val)} min={1} max={10}/>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}> Cancel </Button>
                <Button variant="contained" onClick={handleSave} disabled={loading || saving || !songsReady || rating === null}> {saving ? 'Saving...' : 'Save'} </Button>
            </DialogActions>               
        </Dialog> 
    );
}
