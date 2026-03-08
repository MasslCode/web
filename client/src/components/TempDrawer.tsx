/* eslint-disable react/prop-types */
import { Box, Button } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { useState, ChangeEvent, useEffect } from "react"
import TextSearch from './TextSearch.tsx';
import Albumlist from './Albumlist';

interface TempDrawerProps {
    id: string;
    onSuccess: (album: any) => void;
}

export default function TempDrawer(props: TempDrawerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
      };

    useEffect(() => {
  if (query.trim().length < 2) {
    setDebouncedQuery('');
    return;
  }

  const timer = setTimeout(() => {
    setDebouncedQuery(query);
  }, 400);

  return () => clearTimeout(timer); // clears the timer if query changes before 300ms
}, [query]);

    const handleQueryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setQuery(e.target.value);
      };  
    
    return (
        <div id={props.id}>
            <Button onClick={toggleDrawer(true)}>Search for an album online</Button>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Box sx={{
                    width: 300, 
                    padding: 2,
                    backgroundColor: 'rgb(155, 167, 219)'
                    }}>
                    <h2>Search album online</h2>
                    <TextSearch query={query} onQueryChange={handleQueryChange} />
                    <Albumlist query={debouncedQuery} onSuccess={props.onSuccess}/>
                </Box>
            </Drawer>
        </div>
    );
}

