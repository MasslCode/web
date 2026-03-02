import { AppBar, Container, Typography, Box, Button, Toolbar } from "@mui/material";
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useNavigate } from "react-router-dom";

export default function MenuBar(){

    const pages = [
        { label: 'Home', path: '/' },
        { label: 'Tier List', path: '/tierlist' }
        ];
    const navigate = useNavigate();

    const handlePageClicked = (path: string) => {
        navigate("/tierlist");
    };

    return (
        <div className="border-4 border-[#525925] border-l-0 border-r-0 rounded-lg animate-glow">
            <AppBar position="static" color="transparent" className="bg-gradient-to-r from-lime-300 to-lime-700">
                <div className="bg-[#b0b076] w-full">
                    <Container maxWidth="xl">
                        <Toolbar disableGutters className="flex items-center">
                            <span className="hidden md:flex mr-1 animate-pulse text-amber-700 text-6xl">
                                <EqualizerIcon />
                            </span>
                                <p className="text-5xl font-semibold text-[#0d0d0c] tracking-widest">Albums</p>
                            <div className="flex-1" />
                            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                {pages.map((page) => (
                                    <Button
                                        key={page.path}
                                        onClick={() => navigate(page.path)}
                                        sx={{ my: 2, color: 'white', display: 'block' }}>
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