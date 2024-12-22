import { Box, Button } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { useState } from "react"
import TextSearch from './TextSearch';
import Albumlist from './Albumlist';

export default function TempDrawer(){
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
      };

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
      };  
    
    return (
        <div>
            <Button onClick={toggleDrawer(true)}>Search for an album</Button>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 300, padding: 2 }}>
                    <h2>Search album online</h2>
                    <TextSearch query={query} onQueryChange={handleQueryChange} />
                    <Albumlist query={query} />
                </Box>
            </Drawer>
        </div>
    );
}

