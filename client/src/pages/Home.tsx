import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import '../assets/Home.css';
import TempDrawer from '../components/TempDrawer.tsx';
import Albumdisplay from '../components/Albumdisplay.tsx';
import AlbumsSort from '../components/Albumssort.tsx';
import { Alert, Button, Pagination } from '@mui/material';
import AlbumSearch from '@/components/AlbumSearch.tsx';
import { Progress } from '@/components/ui/progress';

const PAGE_SIZE = 20;

export default function Homepage() {
    const [loading, setLoading] = useState(true);
    const [albums, setAlbums] = useState([]);
    const [view, setView] = useState({ page: 1, sort: 'RANKING_DESC', query: '' });
    const [searchInput, setSearchInput] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const searchPending = searchInput.trim() !== view.query;

    // Refresh the current page and filter after adding or editing an album.
    const refreshAlbums = useCallback(() => setRefreshVersion(version => version + 1), []);

    useEffect(() => {
        if (!searchPending) return;
        const timer = setTimeout(() => {
            setView(previous => ({ ...previous, page: 1, query: searchInput.trim() }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, searchPending]);

    useEffect(() => {
        setLoading(true);
        setLoadError(null);
        setAlbums([]);
        if (searchPending) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        let active = true;
        let pageChanged = false;

        const loadAlbums = async () => {
            try {
                const params = new URLSearchParams({
                    page: String(view.page), limit: String(PAGE_SIZE), sort: view.sort,
                });
                if (view.query) params.set('search', view.query);
                const response = await fetch(`${BASE_URL}/api/albums?${params}`, { signal: controller.signal });
                if (!response.ok) throw new Error('Unable to load albums');
                const data = await response.json();
                if (!active) return;
                if (!Array.isArray(data.albums) || !Number.isInteger(data.totalPages) || data.totalPages < 0
                    || (view.query && data.search !== view.query)) {
                    throw new Error('Invalid album response');
                }

                // A collection can shrink while it is open; use its last available page.
                const page = Math.min(view.page, Math.max(1, data.totalPages));
                if (page !== view.page) {
                    pageChanged = true;
                    setTotalPages(data.totalPages);
                    setView(previous => ({ ...previous, page }));
                    return;
                }
                setAlbums(data.albums);
                setTotalPages(data.totalPages);
                setTotalCount(Number.isInteger(data.totalCount) ? data.totalCount : null);
            } catch {
                if (!active) return;
                setLoadError(controller.signal.aborted
                    ? 'Loading albums took too long. Please try again.'
                    : 'Unable to load your albums. Please try again.');
            } finally {
                clearTimeout(timeout);
                if (active && !pageChanged) setLoading(false);
            }
        };
        void loadAlbums();
        return () => {
            active = false;
            clearTimeout(timeout);
            controller.abort();
        };
    }, [BASE_URL, view, searchPending, refreshVersion]);

    const handleSortChange = (sort: string) => {
        setView({ page: 1, sort, query: searchInput.trim() });
    };

    const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
        setView(previous => ({ ...previous, page }));
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-[#e3e3b3] min-h-screen">
            <Progress indeterminate={loading} className={loading ? 'visible' : 'invisible'} />
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <TempDrawer id="drawer1" onSuccess={refreshAlbums} />
                <div className="flex flex-col items-center w-full">
                    <div className="flex w-full flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <AlbumsSort sortOption={view.sort} onSortChange={handleSortChange} />
                        <div className="w-full min-w-0 sm:max-w-sm">
                            <AlbumSearch query={searchInput} onSearch={setSearchInput} />
                        </div>
                    </div>
                    {loadError && (
                        <Alert severity="error" className="w-full" action={<Button color="inherit" onClick={refreshAlbums}>Retry</Button>}>
                            {loadError}
                        </Alert>
                    )}
                    {!loading && !loadError && albums.length === 0 && (
                        <p role="status" className="w-full py-8 text-center">
                            {view.query ? 'No albums match your search.' : 'Your album collection is empty.'}
                        </p>
                    )}
                    <div className="w-full min-w-0" aria-busy={loading}>
                        <Albumdisplay albums={albums} loading={loading} currentPage={view.page} success={refreshAlbums} />
                    </div>
                    {!loading && !loadError && totalCount !== null && totalCount > 0 && (
                        <p role="status" className="py-2 text-center">
                            {(view.page - 1) * PAGE_SIZE + 1}–{(view.page - 1) * PAGE_SIZE + albums.length} of {totalCount} albums
                        </p>
                    )}
                </div>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center px-4 py-6">
                    <Pagination
                        count={totalPages}
                        page={view.page}
                        onChange={handlePageChange}
                        disabled={loading || Boolean(loadError)}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        siblingCount={0}
                        sx={{ '& .MuiPagination-ul': { justifyContent: 'center' }, '& .MuiPaginationItem-root': { height: 44 } }}
                    />
                </div>
            )}
        </div>
    );
}
