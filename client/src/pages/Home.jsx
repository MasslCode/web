import { useEffect, useState, useCallback } from 'react';
import '../assets/Home.css';
import CircularProgress from '@mui/material/CircularProgress';
//import { useState } from 'react';
import TempDrawer from "../components/TempDrawer.jsx"
import Albumdisplay from '../components/Albumdisplay.jsx';
import AlbumsSort from '../components/Albumssort.jsx';
import { Pagination, Box } from '@mui/material';

export default function Homepage()
{
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOption, setSortOption] = useState('RANKING_DESC');

    const BASE_URL = "https://albums-ink9.onrender.com";
    
        const fetchAlbumList = useCallback(async (page = 1, sort = sortOption) => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/albums?page=${page}&limit=20&sort=${sort}`);
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
        }, [sortOption]);

    useEffect(() => {
        fetchAlbumList(currentPage, sortOption);
    }, [fetchAlbumList, currentPage, sortOption]);

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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', position: 'relative', mb: 2 }}>
                    <AlbumsSort sortOption={sortOption} onSortChange={setSortOption}/>
                    {loading ? (
                        <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <div></div>
                )}
                </Box>
                <Albumdisplay albums={albums} loading={loading} currentPage={currentPage} success={fetchAlbumList}/>
            </Box>
            </div>
            <Pagination 
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
                style={{ marginBottom: '20px' }}
                sx={{
                    padding: 4
                }}
            ></Pagination>
        </div>
    )
}