import { FormControl, InputLabel, MenuItem, Select, Box, Typography, SelectChangeEvent } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

interface AlbumsSortProps {
    sortOption: string;
    onSortChange: (value: string) => void;
}
export default function AlbumsSort({sortOption, onSortChange}: AlbumsSortProps)
{

    const sortOptions = [
        { value: "RANKING_ASC", label: "Rating", icon: <ArrowUpward fontSize="small" /> },
        { value: "RANKING_DESC", label: "Rating", icon: <ArrowDownward fontSize="small" /> },
        { value: "DATE_ADDED_ASC", label: "Oldest", icon: <ArrowUpward fontSize="small" /> },
        { value: "DATE_ADDED_DESC", label: "Newest", icon: <ArrowDownward fontSize="small" /> }
    ];

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        onSortChange(event.target.value);
    }
    return (
        <FormControl sx={{ margin: 1, minWidth: 160 }}>
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
                labelId='sort-select-label'
                id="sort-select"
                value={sortOption}
                label="Sort by"
                onChange={handleSortChange}
                sx={{ textAlign: 'left' }}>
                {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignment: 'center', gap: 1}}>
                            <Typography variant="body2">
                                {option.label}
                            </Typography>
                            {option.icon}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}