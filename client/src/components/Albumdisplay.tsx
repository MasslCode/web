/* eslint-disable react/prop-types */
import { Card, CardContent, Skeleton, Fade } from '@mui/material';
import Albumcard from './Albumcard.tsx';
import EditDialog from './EditDialog.tsx';
import { SetStateAction, useState } from 'react';

interface AlbumDisplayProps {
    albums: any[];
    loading: boolean;
    currentPage: number;
    success: (album: any) => void;
}

export default function Albumdisplay({ albums, loading, currentPage, success }: AlbumDisplayProps)
{
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const skeletonCount = albums.length > 0 ? albums.length : 20;
    const cardSkeletons = Array.from({ length: skeletonCount });
    const gridClassName = 'grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 w-full';

    const handleOpenDialog = (album: SetStateAction<null>) => {
        setSelectedAlbum(album);
    }

    const handleCloseDialog = () => {
        setSelectedAlbum(null);
    }

    return (
        <div className="flex flex-col items-center w-full py-3">
            {loading && albums.length === 0 && (
                <div className={gridClassName}>
                    {cardSkeletons.map((_, index) => (
                        <Card key={index} className="rounded-xl shadow-lg flex flex-col w-full min-w-0" sx={{ p: { xs: 1.5, sm: 2 } }}>
                            <div className="w-full aspect-square">
                                <Skeleton animation="wave" variant="rectangular" width="100%" height="100%" className="rounded-lg" />
                            </div>
                            <CardContent className="flex flex-col flex-1" sx={{ px: 0, py: 1.5, '&:last-child': { pb: 0 } }}>
                                <div className="h-[2.86rem] flex items-center justify-center">
                                    <Skeleton animation="wave" variant="text" height={36} width="80%" />
                                </div>
                                <Skeleton animation="wave" variant="text" height={24} width="60%" className="mx-auto mt-1" />
                                <div className="flex flex-col items-center mt-auto">
                                    <Skeleton animation="wave" variant="text" height={24} width="40%" />
                                </div>
                                <div className="mt-2 flex justify-center min-h-[2.5rem]">
                                    <Skeleton animation="wave" variant="rounded" height={36} width={64} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <Fade in={!loading} timeout={600} key={currentPage}>
                <div className={gridClassName}>
                    {albums.map((album) => (
                        <div key={album.id} className="min-w-0">
                            <Albumcard album={album} onEditClick={() => handleOpenDialog(album)} />
                        </div>
                    ))}
                </div>
            </Fade>
            <EditDialog
                open={Boolean(selectedAlbum)}
                album={selectedAlbum}
                close={handleCloseDialog}
                success={success}
            />
        </div>
    );
}
