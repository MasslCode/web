import { FormControl, InputLabel, MenuItem, Select, Box, Typography } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import React from 'react';

export default function AlbumsSort()
{
    const [sortOption, setSortOption] = React.useState('RANKING DESC');

    const sortOptions = [
        { value: "RANKING ASC", label: "Ranking", icon: <ArrowUpward fontSize="small" /> },
        { value: "RANKING DESC", label: "Ranking", icon: <ArrowDownward fontSize="small" /> },
        { value: "DATE_ADDED ASC", label: "Date Added", icon: <ArrowUpward fontSize="small" /> },
        { value: "DATE_ADDED DESC", label: "Date Added", icon: <ArrowDownward fontSize="small" /> }
    ];

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    }
    return (
        <FormControl sx={{ margin: 1, minWidth: 160, padding: 4 }}>
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
                            {option.icon}
                            <Typography variant="body2">
                                {option.label}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}