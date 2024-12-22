/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"

export default function Albumlist({ query })
{
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/search-albums?query=${query}`);
                const rawAlbums = await response.json();
                const formattedAlbums = rawAlbums.map((album) => ({
                    title: album.name,
                    artist: album.artists.map((artist) => artist.name).join(' - '),
                    release_date: album.release_date,
                    cover_image: album.images[0]?.url,
                  }));
                setAlbums(formattedAlbums);
            } catch (error) {
                console.error("Error fetching albums:" , error);
            }
        };

        if (query) {
            fetchAlbums();
        }
    }, [query]);

return (
    <div>
      {albums.length === 0 ? (
        <p>No albums found.</p>
      ) : (
        albums.map((album, index) => (
          <div key={index} style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
            <h3>{album.title}</h3>
            <p>
              <strong>Artist:</strong> {album.artist}
            </p>
            <p>
              <strong>Release Date:</strong> {album.release_date}
            </p>
            <img src={album.cover_image} alt={`${album.title} cover`} style={{ width: "100px" }} />
          </div>
        ))
      )}
    </div>
  );
}