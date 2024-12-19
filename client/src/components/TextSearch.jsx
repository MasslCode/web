
import { TextField } from "@mui/material"
import { useState } from "react"
import {handleInputText} from "../features/browsedb.js"

export default function TextSearch()
{
    const [searchText, setSearchText] = useState("");

    const handleKeyDown = (event) => 
        {
            console.log("key pressed");
            if(event.key === "Enter")
            {
                if(searchText === "")
                {
                    return;
                }
                console.log("Enter pressed, text sent: ", searchText);
                handleInputText(searchText);
            }
        } 
    return (
        <TextField 
        id="search" 
        label="Search album" 
        type ="search" 
        variant="filled"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}>
        </TextField>
    );
}