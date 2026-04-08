import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import '../assets/Home.css';
import TempDrawer from "../components/TempDrawer.tsx"
import Albumdisplay from '../components/Albumdisplay.tsx';
import AlbumsSort from '../components/Albumssort.tsx';
import { Pagination } from '@mui/material';
import AlbumSearch from '@/components/AlbumSearch.tsx';
import { Progress } from '@/components/ui/progress';

export default function Homepage()
{
    const [loading, setLoading] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOption, setSortOption] = useState('RANKING_DESC');

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
        const fetchAlbumList = useCallback(async (page?: number, sort = sortOption) => {
            console.log(BASE_URL);
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

    const handleSearch = useCallback(async (query: string) => {
        if (!query) {
            fetchAlbumList(1, sortOption);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/lookup-albums?lookupString=${encodeURIComponent(query)}`);
            const data = await response.json();
            setAlbums(data);
            setTotalPages(1);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error searching albums:", error);
        } finally {
            setLoading(false);
        }
    }, [BASE_URL, sortOption, fetchAlbumList]);

    useEffect(() => {
        fetchAlbumList(1);
    }, [fetchAlbumList]);

    const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
        fetchAlbumList(value);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
      };

    return (
        <div className="bg-[#e3e3b3] min-h-screen">
            {loading && <Progress indeterminate className="fixed top-0 left-0 z-50 rounded-none" />}
            <div>
            <TempDrawer id="drawer1" onSuccess={fetchAlbumList}/>
            <div className="flex flex-col items-center w-full">
                <div className="relative flex items-center w-4/5 mb-2">
                    <AlbumsSort sortOption={sortOption} onSortChange={setSortOption}/>
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <AlbumSearch onSearch={handleSearch} />
                    </div>
                </div>
                <div className="w-full px-30">
                    <Albumdisplay albums={albums} loading={loading} currentPage={currentPage} success={fetchAlbumList}/>
                </div>
            </div>
            </div>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
            ></Pagination>
        </div>
    )
}