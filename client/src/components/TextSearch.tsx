import { TextField } from "@mui/material"

interface TextSearchProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function TextSearch({ query, onQueryChange }: TextSearchProps)
{
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