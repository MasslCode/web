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
      fetch(`http://localhost:3001/api/search-albums?query=${text}`)
         .then((res) => res.json())
         .then((albums) => console.log(albums))
         .catch((error) => console.error("Error fetching albums:", error));
    } catch (err)
    {
      console.error("issue fetching local api endpoint");
    }
}