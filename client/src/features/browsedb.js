/* eslint-disable no-unused-vars */

export const handleInputText = async (text) => {
    console.log("Text received: ", text);
    try 
    {
       const result = await fetch('http://localhost:4999/api/albums');
       if (!result.ok) {
        throw new Error('Failed to fetch albums');
      }
       const allAlbums = await result.json();
       console.log(allAlbums);
       //return allAlbums;
    } catch (err) 
    {
       console.error("There was an error displaying db data.")
    }

    try{
      const response = await fetch(`http://localhost:3001/api/search-albums?query=${text}`);
      const albums = await response.json();
      console.log(albums);
      const formattedAlbums = splitAlbums(albums);
    } catch (err)
    {
      console.error("issue fetching local api endpoint");
    }
}

export const splitAlbums = async (albums) => {
   console.log("im in the split albums function now: ", albums);
   const albumDetails = albums.map((album) => {
      return {
         id: album.id,
         name: album.name,
         artist: album.artists.map((artist) => artist.name).join(" - "),
         releaseDate: album.release_date,
         coverImage: album.images.length > 0 ? album.images[0].url : "No image available",
         trackCount: album.total_tracks
      };
   });

   console.log("Extracted album details:", albumDetails);
}