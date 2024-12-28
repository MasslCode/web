/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import { TextField } from "@mui/material"
import { useState } from "react"
import { useFormControl } from '@mui/material/FormControl';

export default function TextSearch({ query, onQueryChange })
{
    const [searchText, setSearchText] = useState("");

    return (
        <TextField
        sx={{
            backgroundColor: 'rgb(205, 211, 240)'
        }}
        id="search" 
        label="Search album" 
        type ="search" 
        variant="filled"
        onChange={onQueryChange}
        value={query}>
        </TextField>
    );
}