/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { createTheme } from '@mui/material/styles';

export default function Editbutton({album})
{
    const theme = createTheme({
        palette: {
          babyblue: '#77a9bf',
        },
      });

    const handleClick = () => {
        console.log("album clicked: ", album);
    };
    
    return(
        <Button
            onClick={handleClick}
            color="babyblue"
            endIcon={<Edit />}
        >
        Edit 
        </Button>
    );
}