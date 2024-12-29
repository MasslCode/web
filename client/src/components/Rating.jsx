import { Box, Tooltip } from "@mui/material";
import { useState } from "react";
import AlbumIcon from '@mui/icons-material/Album';
import ScoreDialog from "./ScoreDialog";

export default function SongRating({ rating, setRating })
{

    const ratingOptions = [
        { key: 'Amazing', value: 10 },
        { key: 'Great', value: 8 },
        { key: 'Good', value: 6 },
        { key: 'Okay', value: 4 },
        { key: 'Bad', value: 2 },
        { key: 'Interlude', value: 0 },
    ];


    const getColorForValue = (value) => {
        if (value == 10) return 'magenta';
        if (value == 8) return 'blue';
        if (value == 6) return 'green';
        if (value == 4) return 'orange';
        if (value == 2) return 'red';
        return 'black';
    }

    const passColors = (value) => {
        setRating(value);
    }
    return (
        <Box>
            {ratingOptions.map((option) => (
              <Tooltip key={option.value} title={option.key} arrow>
                <AlbumIcon
                    sx={{
                       color: getColorForValue(option.value),
                       cursor: 'pointer',
                       fontSize: 20,
                       marginRight: 3, 
                    }}
                    onClick={() => passColors(option.value)}
                />
              </Tooltip>
            ))}
        </Box>
    )
}

