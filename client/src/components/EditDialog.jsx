/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogTitle, Button } from "@mui/material";
export default function EditDialog({open, close, success, album, songs})
{
    return (
        <Dialog
            open={open}
            close={close}
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
                <Button onClick={close}> Cancel </Button>
                <Button variant="contained" onClick={success}> Save </Button>
            </DialogActions>
        </Dialog>
    );
}