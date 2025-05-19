import { AppBar, Container, Typography, Box, Button } from "@mui/material";
import { Toolbar } from "radix-ui";
import EqualizerIcon from '@mui/icons-material/Equalizer';

export default function MenuBar(){

    const pages = ['Tierlist'];

    const handlePageClicked = () => {
        console.log("Page clicked");
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <EqualizerIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: {xs: 'none', md: 'flex'},
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none'
                        }}>
                        ALBUMS
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handlePageClicked}
                                sx={{ my: 2, color: 'white', display: 'block' }}>
                            {page}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};