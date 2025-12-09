import { Box, Slider, Stack } from "@mui/material";
import HeartBrokenSharpIcon from '@mui/icons-material/HeartBrokenSharp';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface SliderRatingProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}
export default function SliderRating({value = 5, min = 1, max = 10, onChange}: SliderRatingProps){

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
                        onChange={(e, newValue) => onChange(Array.isArray(newValue) ? newValue[0] : newValue)}>
                </Slider>
                <FavoriteIcon />
            </Stack>
        </Box>
    );
}