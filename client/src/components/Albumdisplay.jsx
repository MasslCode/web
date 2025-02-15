/* eslint-disable react/prop-types */
import { Card, CardMedia, CardContent, Typography, Box, Skeleton, Fade } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function Albumdisplay({albums, loading })
{
    const cardSkeletons = Array.from({ length: 20 });

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
            <Fade in={!loading} timeout={500}>
                <Box sx={{ width: '100%' }}> 
                    <Grid container spacing={4}>
                    {albums.map((album, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card sx={{ maxWidth: 300, height: 500, margin: 'auto', borderRadius: 2, boxShadow: 3}}>
                            <CardMedia 
                                component="img"
                                height="300"
                                image={album.cover_image || "https://via.placeholder.com/150"}
                                alt={album.title}
                                sx={{ borderRadius: '4px'}}
                            />
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    gutterBottom
                                    sx={{ 
                                        fontSize: `${Math.max(1, 2.5 - album.title.length * 0.05)}rem`,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        wordWrap: 'break-word',
                                        marginBottom: 1 }}>
                                {album.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textAlign: 'center' }}>
                                {album.artist}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="black"
                                    sx={{ textAlign: 'center', marginTop: 1 }}>
                                {`Rating: ${album.average_rating.toFixed(1) || 'N/A'}`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    ))}
                </Grid>
            </Box>
        </Fade>
    </Grid>
    </Box>
    );
}