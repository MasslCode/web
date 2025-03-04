/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { Edit } from "@mui/icons-material";

export default function Editbutton({album})
{
    const handleClick = (e) => {
        e.stopPropagation();
        console.log("album clicked: ", album);
    };
    
    return(
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
    );
}