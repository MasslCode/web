/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { Album, Edit } from "@mui/icons-material";
import EditDialog from "./EditDialog.tsx";
import { useState, SetStateAction } from "react";

interface Album {
    id: number;
    title: string;
    cover_image: string;
    average_rating: number;
}
export default function Editbutton({ album }: { album: Album })
{
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        console.log("album clicked: ", album);
        setSelectedAlbum(album);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
      };
    
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
            success={(album) => {
                console.log("Editing successful...");
                setSelectedAlbum(null);
            }}
            TransitionProps={{
                onExited: () => setSelectedAlbum(null),
            }}
        />
        </div>
    );
}
