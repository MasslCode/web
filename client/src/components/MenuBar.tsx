import { AppBar, Container, Typography, Box, Button, Toolbar } from "@mui/material";
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { Link, useLocation } from "react-router-dom";

export default function MenuBar(){

    const pages = [
        { label: 'Home', path: '/' },
        { label: 'Tier List', path: '/tierlist' }
        ];
    const { pathname } = useLocation();

    return (
        <div className="border-4 border-[#525925] border-l-0 border-r-0 rounded-lg animate-glow">
            <AppBar position="static" color="transparent" className="bg-gradient-to-r from-lime-300 to-lime-700">
                <div className="bg-[#b0b076] w-full">
                    <Container maxWidth="xl">
                        <Toolbar disableGutters sx={{ flexWrap: 'wrap', gap: 1, py: 1 }}>
                            <span className="hidden md:flex mr-1 animate-pulse text-amber-700 text-6xl">
                                <EqualizerIcon />
                            </span>
                            <Typography component={Link} to="/" sx={{ color: '#0d0d0c', textDecoration: 'none', fontSize: { xs: '1.75rem', sm: '2.5rem', lg: '3rem' }, fontWeight: 600, letterSpacing: '.08em' }}>Albums</Typography>
                            <Box component="nav" aria-label="Main navigation" sx={{ display: 'flex', flexWrap: 'wrap', gap: .5, ml: 'auto' }}>
                                {pages.map((page) => (
                                    <Button
                                        key={page.path}
                                        component={Link}
                                        to={page.path}
                                        aria-current={pathname === page.path ? 'page' : undefined}
                                        sx={{ minHeight: 44, color: '#0d0d0c', backgroundColor: pathname === page.path ? 'rgba(255,255,255,.25)' : 'transparent' }}>
                                    {page.label}
                                    </Button>
                                ))}
                            </Box>
                        </Toolbar>
                    </Container>
                </div>
            </AppBar>
        </div>
    );
};
