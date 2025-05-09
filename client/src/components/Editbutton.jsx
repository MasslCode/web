/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { Edit } from "@mui/icons-material";
import EditDialog from "./EditDialog";
import { useState, useEffect } from "react";

export default function Editbutton({album})
{
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const handleClick = (e) => {
        e.stopPropagation();
        console.log("album clicked: ", album);
        setSelectedAlbum(album);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
      };

    useEffect(() => {


    },[]);
    
    return(
        <div>
        <Button
            onClick={ (e) => handleClick(e)}
            endIcon={<Edit />}
            sx={{
                backgroundColor: "#77a9bf",
                color: "white",
                "&:hover": {
                    backgroundColor: "#5e8fa6",
                },
            }}
        >
        Edit 
        </Button>
        <EditDialog 
            open={dialogOpen}
            album={selectedAlbum}
            close={handleDialogClose}
            TransitionProps={{ onExited: () => setSelectedAlbum(null) }}
        />
        </div>
    );
}