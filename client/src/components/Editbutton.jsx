/* eslint-disable react/prop-types */
import { Button } from "@mui/material";

export default function Editbutton({album})
{
    const handleClick = () => {
        console.log("album clicked: ", album);
    };
    
    return(
        <Button
            onClick={handleClick}
        >
        </Button>
    );
}