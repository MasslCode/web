/* eslint-disable react/prop-types */
import { Card, CardMedia, CardContent, Typography, Box, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function Albumdisplay({albums, loading })
{
    const cardSkeletons = Array.from({ length: 20 });

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
            <Grid container spacing={4} justifyContent="center" >
                {loading ? cardSkeletons.map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card
                          sx={{
                            maxWidth: 300,
                            height: 500,
                            margin: 'auto',
                            borderRadius: 2,
                            boxShadow: 3
                          }}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '4px' }}></Skeleton>
                            <CardContent>
                                <Skeleton variant="text" height={40} width="80%" sx={{ margin: 'auto', marginBottom: 1 }}></Skeleton>
                                <Skeleton variant="text" height={20} width="60%" sx={{ margin: 'auto', marginBottom: 1 }}></Skeleton>
                                <Skeleton variant="text" height={20} width="40%" sx={{ margin: 'auto' }}></Skeleton>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
                : albums.map((album, index) => (
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
    );
}