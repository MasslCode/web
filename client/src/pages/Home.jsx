import { useEffect, useState, useCallback } from 'react';
import '../assets/Home.css';
import CircularProgress from '@mui/material/CircularProgress';
//import { useState } from 'react';
import TempDrawer from "../components/TempDrawer.jsx"
import Albumdisplay from '../components/Albumdisplay.jsx';
import { Pagination } from '@mui/material';

export default function Homepage()
{
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const BASE_URL = "https://albums-ink9.onrender.com";
    
        const fetchAlbumList = useCallback(async (page = 1) => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/albums?page=${page}&limit=20`);
                const data = await response.json();
                
                if (data.albums.length > 0)
                {
                    setAlbums(data.albums);
                }
                setTotalPages(data.totalPages);
                setCurrentPage(page);
            } catch (error) {
                console.error("Error fetching Albumlist:", error);
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        fetchAlbumList(currentPage);
    }, [fetchAlbumList, currentPage]);

    const handlePageChange = (event, value) => {
        fetchAlbumList(value);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
      };

    return (
        <div>
            <div>
            <h1 id="uber">Alben</h1>
            <TempDrawer id="drawer1" onSuccess={fetchAlbumList}/>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <CircularProgress />
                </div>
            ) : (
                <div></div>
            )}
            <Albumdisplay albums={albums} loading={loading} currentPage={currentPage}/>
            </div>
            <Pagination 
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
                style={{ marginBottom: '20px' }}
            ></Pagination>
        </div>
    )
}