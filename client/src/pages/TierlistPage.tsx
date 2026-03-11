import { Box, Typography, CircularProgress, Grid2 } from "@mui/material";
import { useEffect, useState } from "react";

interface Album {
  id: string;
  title: string;
  cover_image: string;
  average_rating: number;
}

export default function TierlistPage(){
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/albums`);
        const data = await response.json();
        const rated = data.albums.filter((a: Album) => a.average_rating);
        setAlbums(rated);;
      } catch (error) {
        console.error("Failed to fetch albums", error);
      }
      finally
      {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);
  
  const getAlbumsByRating = (rating: number) => {
    return albums.filter(album => album.average_rating === rating);
  };

  if (loading) {
    return (
      <Box className="bg-[#e3e3b3] min-h-screen flex items-center justify-center" >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box p={4} className="bg-[#e3e3b3]">
      <Typography variant="h3" gutterBottom>Tier List</Typography>
      {[...Array(10)].map((_, i) => {
        const rating = 10 - i; // Start from 10 down to 1
        const tierAlbums = getAlbumsByRating(rating);

        return (
          <Box key={rating} mb={4}>
            <Typography variant="h4" gutterBottom>
             {rating}
            </Typography>
            {tierAlbums.length === 0 ? (
              <Typography color="text.secondary">No albums in this tier.</Typography>
            ) : (
              <Grid2 container spacing={2}>
                {tierAlbums.map(album => (
                  <Grid2 key={album.id}>
                    <Box
                      component="img"
                      src={album.cover_image}
                      alt={album.title}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        objectFit: 'cover',
                        border: '2px solid #000000ff',
                      }}
                    />
                  </Grid2>
                ))}
              </Grid2>
            )}
          </Box>
        );
      })}
    </Box>
  );
}