import { useEffect, useState, useCallback } from 'react';
import '../assets/Home.css';
//import { useState } from 'react';
import TempDrawer from "../components/TempDrawer.jsx"
import Albumdisplay from '../components/Albumdisplay.jsx';

export default function Homepage()
{
    const [albums, setAlbums] = useState([]);

    const BASE_URL = "https://albums-ink9.onrender.com";
    
        const fetchAlbumList = useCallback(async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/albums`);
                const albumlist = await response.json();
                console.log(albumlist);
                setAlbums(albumlist);
            } catch (error) {
                console.error("Error fetching Albumlist:", error);
            }
        }, []);

    useEffect(() => {
        fetchAlbumList();
    }, [fetchAlbumList]);

    return (
        <div>
            <h1 id="uber">Alben</h1>
            <TempDrawer id="drawer1" onSuccess={fetchAlbumList}/>
            <Albumdisplay albums={albums}/>
        </div>
    )
}