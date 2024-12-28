/* eslint-disable react/prop-types */
import { Dialog, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react"

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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pr: 6,
                }}>
             {album?.title}
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
        </Dialog>
    );
}