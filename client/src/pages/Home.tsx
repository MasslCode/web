import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import '../assets/Home.css';
import CircularProgress from '@mui/material/CircularProgress';
//import { useState } from 'react';
import TempDrawer from "../components/TempDrawer.tsx"
import Albumdisplay from '../components/Albumdisplay.tsx';
import AlbumsSort from '../components/Albumssort.tsx';
import { Pagination, Box } from '@mui/material';

export default function Homepage()
{
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOption, setSortOption] = useState('RANKING_DESC');

    const BASE_URL = "https://albums-ink9.onrender.com";
    
        const fetchAlbumList = useCallback(async (page?: number, sort = sortOption) => {
            const validPage = typeof page === "number" && page > 0 ? page : 1;
            console.log("FETCHING albumlist with page:", validPage, "and sort:", sort);    
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/albums?page=${validPage}&limit=20&sort=${sort}`);
                const data = await response.json();
                
                if (data.albums.length > 0)
                {
                    setAlbums(data.albums);
                }
                setTotalPages(data.totalPages);
                setCurrentPage(validPage);
            } catch (error) {
                console.error("Error fetching Albumlist:", error);
            } finally {
                setLoading(false);
            }
        }, [sortOption]);

    useEffect(() => {
        fetchAlbumList(currentPage, sortOption);
    }, [fetchAlbumList, currentPage, sortOption]);

    const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
        fetchAlbumList(value);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
      };

    return (
        <div className="h-14 bg-linear-to-bl from-violet-500 to-fuchsia-500">
            <div>
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