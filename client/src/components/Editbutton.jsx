/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { Edit } from "@mui/icons-material";

export default function Editbutton({album})
{
    const handleClick = () => {
        console.log("album clicked: ", album);
    };
    
    return(
        <Button
            onClick={handleClick}
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
    );
}