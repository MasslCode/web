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
    const [buttonVisible, setButtonVisible] = useState(true);
    
    return (
        <Card className="group rounded-xl shadow-lg p-4 bg-[#b0b076] flex flex-col w-full border-2 border-[#525925] animate-glow"
            sx={{ backgroundColor: '#b0b076' }}>
            {!flipped ? (
            <>
            <CardMedia
                component="img"
                className="w-full aspect-square rounded-lg shadow-md object-cover"
                image={album?.cover_image || "https://via.placeholder.com/150"}
                alt={album?.title}
            />
            <CardContent className="flex flex-col flex-1">
                <div className="h-[2.86rem]">
                <Typography className="text-[#0d0d0c] font-semibold text-center break-words line-clamp-2"
                    variant="h6"
                    component="div"
                    gutterBottom
                    sx={{
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                    }}>
                {album?.title}
                </Typography>
               </div>
                <Typography
                     className="text-[#0d0d0c] text-sm sm:text-base text-center mt-1 truncate"
                     title={album?.artist}> 
                {album?.artist}
                </Typography>
            <div className="flex flex-col items-center mt-auto">
                <Typography className="text-[#0d0d0c] text-sm sm:text-base font-medium text-center">
                    {`Rating: ${album?.average_rating.toFixed(0) || 'N/A'}`}
                </Typography>
            </div>
            <div className="mt-2 flex justify-center min-h-[2.5rem]">
            {buttonVisible && (
                <Button
                variant="contained"
                onClick={(e) => {
                    e.stopPropagation();
                    onEditClick();
                }}
                >
                Edit
                </Button>
            )}
            </div>
            </CardContent> 
            </>
            ) : (
            <CardContent
                
            ></CardContent>
            )}
        </Card>
    );
}