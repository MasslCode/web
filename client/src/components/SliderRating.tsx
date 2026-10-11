import { Box, Slider, Stack } from "@mui/material";
import HeartBrokenSharpIcon from '@mui/icons-material/HeartBrokenSharp';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface SliderRatingProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}
export default function SliderRating({value = 5, min = 1, max = 10, onChange, disabled = false}: SliderRatingProps){

    return (
        <Box sx={{ width: '100%', minWidth: 0 }}>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center', minWidth: 0, minHeight: 44, mb: 1 }}>
                <HeartBrokenSharpIcon />
                <Slider aria-label="Rating"
                        valueLabelDisplay="auto"
                        color="secondary"
                        value={value} 
                        min={min} 
                        max={max}
                        disabled={disabled}
                        onChange={(e, newValue) => onChange(Array.isArray(newValue) ? newValue[0] : newValue)}>
                </Slider>
                <FavoriteIcon />
            </Stack>
        </Box>
    );
}
