/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogTitle, Button } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
export default function EditDialog({open, close, success, album, albumID, songs})
{
    const BASE_URL_DB = "https://albums-ink9.onrender.com";

    const [loading, setLoading] = useState(false);

    const handleEditSave = async () => {
        
    };
    const fetchSongs = useCallback(async () => {}, []);
    useEffect(() => {
        
    }, [albumID, open]);
    
    return (
        <Dialog
            open={open}
            onClose={close}
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
             Edit album
            </DialogTitle>
            <DialogActions>
                <Button variant="contained" color="error" onClick={close}> Cancel </Button>
                <Button variant="contained" color="success" onClick={handleEditSave}> Save </Button>
            </DialogActions>
        </Dialog>
    );
}
