/* eslint-disable react/prop-types */
import { Card, CardContent, Box, Skeleton, Fade, Grid2 } from '@mui/material';
import Albumcard from './Albumcard.tsx';
import EditDialog from './EditDialog.tsx';
import { SetStateAction, useState } from 'react';

interface AlbumDisplayProps {
    albums: any[];
    loading: boolean;
    currentPage: number;
    success: (album: any) => void;
}

export default function Albumdisplay({ albums, loading, currentPage, success }: AlbumDisplayProps)
{
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const cardSkeletons = Array.from({ length: 20 });

    const handleOpenDialog = (album: SetStateAction<null>) => {
        setSelectedAlbum(album);
    }

    const handleCloseDialog = () => {
        setSelectedAlbum(null);
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
            <Grid2 container spacing={4} justifyContent="center" >
                {loading && albums.length === 0 ? cardSkeletons.map((_, index) => (
                    <Grid2 key={index} xs={12} sm={6} md={4} lg={3} >
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
                    </Grid2>
                ))
                : null}
            <Fade in={!loading} timeout={600} key={currentPage}>
                <Box sx={{ width: '100%' }}> 
                    <Grid2 container spacing={4} justifyContent="center">
                    {albums.map((album, index) => (
                    <Grid2 key={index} xs={12} sm={6} md={4} lg={3} >
                        <Albumcard album={album} onEditClick={() => handleOpenDialog(album)}></Albumcard>
                    </Grid2>
                    ))}
                </Grid2>
            </Box>
        </Fade>
    </Grid2>
        <EditDialog
            open={Boolean(selectedAlbum)}
            album={selectedAlbum}
            close={handleCloseDialog}
            success={(album) => success}
        />
    </Box>
    );
}