import { Box, Button } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { useState } from "react"
import TextSearch from './TextSearch';
import Albumlist from './Albumlist';

export default function TempDrawer(props){
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
      };

    const handleQueryChange = (e) => {
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
                    <Albumlist query={query} />
                </Box>
            </Drawer>
        </div>
    );
}

