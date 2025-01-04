/* eslint-disable react/prop-types */
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function Albumdisplay( {albums} )
{
    return (
        <Box sx={{ padding: 4 }}>
            <Grid container spacing={4}>
                {albums.map((album, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ maxWidth: 300, margin: 'auto', borderRadius: 2, boxShadow: 3}}>
                            <CardMedia 
                                component="img"
                                height="200"
                                image={album.cover_image || "https://via.placeholder.com/150"}
                                alt={album.title}
                                sx={{ borderRadius: '4px'}}
                            />
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 1 }}>
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