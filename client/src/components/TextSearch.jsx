/* eslint-disable no-unused-vars */

import { TextField } from "@mui/material"
import { useState } from "react"
import {handleInputText} from "../features/browsedb.js"
import { useFormControl } from '@mui/material/FormControl';

export default function TextSearch({ query, onQueryChange })
{
    const [searchText, setSearchText] = useState("");

    return (
        <TextField 
        id="search" 
        label="Search album" 
        type ="search" 
        variant="filled"
        onChange={onQueryChange}
        value={query}>
        </TextField>
    );
}