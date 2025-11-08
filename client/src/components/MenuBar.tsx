import { AppBar, Container, Typography, Box, Button, Toolbar } from "@mui/material";
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useNavigate } from "react-router-dom";

export default function MenuBar(){

    const pages = ['Tierlist'];
    const navigate = useNavigate();

    const handlePageClicked = () => {
        navigate("/tierlist");
    };

    return (
        <div className="border-4 border-violet-400 rounded-lg animate-pulse-border animate-glow">
            <AppBar position="static" color="transparent" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="bg-linear-to-br from-black to-violet-600 w-full">
                    <Container maxWidth="xl">
                        <Toolbar disableGutters>
                            <span className="hidden md:flex mr-1 animate-pulse text-cyan-700 text-6xl">
                                <EqualizerIcon />
                            </span>
                                <p className="font-rubik-iso text-7xl font-semibold text-cyan-700 tracking-widest pr-0 md:pr-[15px]">Albums</p>
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
                </div>
            </AppBar>
        </div>
    );
};