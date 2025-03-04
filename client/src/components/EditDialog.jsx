/* eslint-disable react/prop-types */
import { Dialog, DialogActions, Button } from "@mui/material";
export default function EditDialog({open, close, success, album, songs})
{
    return (
        <Dialog>
            <DialogActions>
                <Button onClick={close}> Cancel </Button>
                <Button variant="contained" onClick={null}> Save </Button>
            </DialogActions>
        </Dialog>
    );
}