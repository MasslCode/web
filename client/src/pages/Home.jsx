import { useEffect } from 'react';
import '../assets/Home.css';
//import { useState } from 'react';
import TempDrawer from "../components/TempDrawer.jsx"
import { Box } from "@mui/material";

export default function Homepage()
{
        useEffect(() => {
            const fetchAlbumList = async () => {
                try {
                    const response = await fetch("http://localhost:4999/api/albums");
                    const albumlist = await response.json();
                    console.log(albumlist);
                } catch (error) {
                    console.error("Error fetching Albumlist:", error);
                }
            };
            fetchAlbumList();
        })
    return (
        <div>
            <h1 id="uber">Alben</h1>
            <TempDrawer id="drawer1"/>
            <Box>

            </Box>
        </div>
    )
}