import { Box, Slider, Stack } from "@mui/material";
import HeartBrokenSharpIcon from '@mui/icons-material/HeartBrokenSharp';
import FavoriteIcon from '@mui/icons-material/Favorite';


// eslint-disable-next-line react/prop-types
export default function SliderRating({value = 5, min = 1, max = 10, onChange}){

    return (
        <Box sx={{ width: "24vw" }}>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
                <HeartBrokenSharpIcon />
                <Slider aria-label="Rating"
                        valueLabelDisplay="auto"
                        color="secondary"
                        value={value} 
                        min={min} 
                        max={max} 
                        onChange={(e, newValue) => onChange(newValue)}>
                </Slider>
                <FavoriteIcon />
            </Stack>
        </Box>
    );
}