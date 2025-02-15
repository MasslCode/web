/* eslint-disable react/prop-types */
import { Box, Tooltip } from "@mui/material";
import AlbumIcon from '@mui/icons-material/Album';
import { getColorForValue } from "../../../backend/colors.js";

export default function SongRating({ onRatingChange })
{

    const ratingOptions = [
        { key: 'Amazing', value: 10 },
        { key: 'Great', value: 8 },
        { key: 'Good', value: 6 },
        { key: 'Okay', value: 4 },
        { key: 'Bad', value: 2 },
        { key: 'Interlude', value: 0 },
    ];

    const passColors = (value) => {
        onRatingChange(value);
    }
    return (
        <Box>
            {ratingOptions.map((option) => (
              <Tooltip key={option.value} title={option.key} placement="top" >
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

