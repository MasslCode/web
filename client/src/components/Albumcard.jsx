/* eslint-disable react/prop-types */
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { motion } from "framer-motion"
import { useState } from 'react';

export default function Albumcard({album})
{
    const [flipped, setFlipped] = useState(false);

    const handleFlip = () => {
        setFlipped(!flipped);
    };

    return (
      <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        perspective: 1000,
        cursor: "pointer",
      }}
      onClick={handleFlip}
      >
        <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{
                position: "relative",
                width: 300,
                height: 500,
                transformStyle: "preserve-3d",
            }}
        >
        <Card sx={{ maxWidth: 300, height: 500, margin: 'auto', borderRadius: 2, boxShadow: 3, backfaceVisibility: "hidden"}}>
            {!flipped ? (
            <>
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
            </>
            ) : (
                <CardContent
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "white",
                        transform: "rotateY(180deg)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        /* backfaceVisibility: "hidden", */
                    }}
                ></CardContent>
            )}
        </Card>
        </motion.div>
    </motion.div>
    );
}