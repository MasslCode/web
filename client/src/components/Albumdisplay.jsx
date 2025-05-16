/* eslint-disable react/prop-types */
import { Card, CardContent, Box, Skeleton, Fade } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Albumcard from './Albumcard';
import EditDialog from './EditDialog';
import { useState } from 'react';

export default function Albumdisplay({albums, loading, currentPage })
{
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const cardSkeletons = Array.from({ length: 20 });

    const handleOpenDialog = (album) => {
        setSelectedAlbum(album);
    }

    const handleCloseDialog = () => {
        setSelectedAlbum(null);
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
            <Grid container spacing={4} justifyContent="center" >
                {loading && albums.length === 0 ? cardSkeletons.map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card
                          sx={{
                            maxWidth: 300,
                            width: '100%',
                            minWidth: 300,
                            height: 500,
                            margin: 'auto',
                            borderRadius: 2,
                            boxShadow: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={300} sx={{ borderRadius: '4px' }}></Skeleton>
                            <CardContent sx={{ width: '100%', textAlign: 'center', flexGrow: 1 }}>
                                <Skeleton animation="wave" variant="text" height={40} width="80%" sx={{ display: 'block', margin: '0 auto 1rem' }}></Skeleton>
                                <Skeleton animation="wave" variant="text" height={20} width="60%" sx={{ display: 'block', margin: '0 auto 1rem' }}></Skeleton>
                                <Skeleton animation="wave" variant="text" height={20} width="40%" sx={{ display: 'block', margin: '0 auto' }}></Skeleton>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
                : null}
            <Fade in={!loading} timeout={600} key={currentPage}>
                <Box sx={{ width: '100%' }}> 
                    <Grid container spacing={4} justifyContent="center">
                    {albums.map((album, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Albumcard album={album} onEditClick={() => handleOpenDialog(album)}></Albumcard>
                    </Grid>
                    ))}
                </Grid>
            </Box>
        </Fade>
    </Grid>
        <EditDialog
            open={Boolean(selectedAlbum)}
            album={selectedAlbum}
            close={handleCloseDialog}
        />
    </Box>
    );
}