/* eslint-disable react/prop-types */
import { Card, CardMedia, CardContent, Typography, Box, Button } from '@mui/material';
import { motion } from "framer-motion"
import { useState } from 'react';

interface AlbumcardProps {
    album: { id: string; title: string; cover_image: string; average_rating: number, artist: string } | null;
    onEditClick: () => void;
}
export default function Albumcard({album, onEditClick }: AlbumcardProps)
{
    const [flipped, setFlipped] = useState(false);
    const [buttonVisible, setButtonVisible] = useState(false);
    
    const handleFlip = () => {
        setFlipped(!flipped);
    };

    return (
      <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        perspective: 1000,
        cursor: "pointer",
        willChange: "transform",
      }}
      onHoverStart={() => setButtonVisible(true)}
      onHoverEnd={() => setButtonVisible(false)}
      >
        <motion.div
            onClick={handleFlip}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{
                position: "relative",
                width: 300,
                height: 500,
                transformStyle: "preserve-3d",
            }}
        >
        <Card className="rounded-xl shadow-lg p-4 bg-[#b0b076]"
            sx={{
                maxWidth: 300,
                height: 500,
                margin: 'auto',
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: '#b0b076',
                display: 'flex',
                flexDirection: 'column',
            }}>
            {!flipped ? (
            <>
            <CardMedia className="rounded-lg shadow-md mb-3"
                component="img"
                height="300"
                image={album?.cover_image || "https://via.placeholder.com/150"}
                alt={album?.title}
            />
            <CardContent className="flex flex-col justify-between flex-1 p-0">
            <div>
                <Typography className="text-[#0d0d0c] font-semibold text-center break-words line-clamp-2"
                    variant="h6"
                    component="div"
                    gutterBottom
                    sx={{
                        fontSize: `${Math.max(1, 2.5 - (album?.title?.length ?? 0) * 0.05)}rem`,
                        minHeight: '3rem',
                        overflow: 'hidden',
                    }}>
                {album?.title}
                </Typography>
                <Typography
                     className="text-[#0d0d0c] text-sm text-center">
                {album?.artist}            
                </Typography>
            </div>
            <div className="flex flex-col items-center mt-4">
            <Typography className="text-[#0d0d0c] text-sm font-medium text-center">
            {`Rating: ${album?.average_rating.toFixed(0) || 'N/A'}`}
            </Typography>

            {buttonVisible && !flipped && (
            <Box className="mt-2 flex justify-center">
                <Button
                variant="contained"
                onClick={(e) => {
                    e.stopPropagation();
                    onEditClick();
                }}
                >
                Edit
                </Button>
            </Box>
            )}
            </div>
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
                    backfaceVisibility: "hidden",
                }}
            ></CardContent>
            )}
        </Card>
        </motion.div>
    </motion.div>
    );
}